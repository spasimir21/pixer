import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents, useCleanup, useComputed, useEffect, useState } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useAlbum } from '../../../context/AlbumContext';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';
import { IconComponent } from '../../../components/Icon';
import {
  faArrowLeft,
  faArrowUpFromBracket,
  faCaretLeft,
  faCaretRight,
  faCross,
  faFileArrowDown,
  faInbox,
  faLock,
  faTrash,
  faUnlock,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useService } from '@lib/service';
import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { toHex } from '@lib/utils/hex';
import { ImageSelectComponent, SelectedImage } from '../../../components/image/ImageSelect';
import { APIServiceManager } from '../../../service/APIService';
import { requests } from '../../../api/requests';
import { aesDecrypt, importAESKey, importUserPublicKeys, rsaDecrypt, UserPublicKeys } from '../../../logic/crypto';
import { ImageUploadComponent, UserPublicKeysWithId } from '../../../components/image/ImageUpload';
import { AlbumType } from '@api/dto/album';
import { ProfileIconComponent } from '../../../components/ProfileIcon/ProfileIcon';
import { B2ServiceManager } from '../../../service/B2Service';
import { Image } from '@api/dto/image';
import { createReactiveCallback, makeReactive, runWithoutTracking, ValueNode } from '@lib/reactivity';
import { formatDate, formatDateAlt, formatDateInput, formatTime, MonthTranslationKeys } from '../../../misc/date';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import { Toast } from '@capacitor/toast';

interface ImageGroup {
  date: number;
  month: number;
  year: number;
  images: Image[];
}

const AlbumImagesPageComponent = Component((): UINode => {
  const [Icon, ProfileIcon, ImageSelect, ImageUpload] = useChildComponents(
    IconComponent,
    ProfileIconComponent,
    ImageSelectComponent,
    ImageUploadComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const b2Service = useService(B2ServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  const album = useAlbum();

  const fromFilterInput = useState(null as HTMLInputElement | null);
  const upToFilterInput = useState(null as HTMLInputElement | null);

  const hasFilters = useState({
    from: false,
    upTo: false
  });

  const filters = useState({
    from: Date.now(),
    upTo: Date.now()
  });

  const isCollaborator = useComputed(() => {
    if (authService.user == null || $album == null) return false;
    const userId = toHex(authService.user.id);
    return toHex($album!.creator.id) === userId || $album!.users.map(({ id }) => toHex(id)).includes(userId);
  });

  const userPublicKeys = useState([] as UserPublicKeysWithId[]);

  if (isCollaborator && $album)
    apiService
      .send(requests.user.getPublicKeys, { userIds: [$album!.creator.id, ...$album!.users.map(user => user.id)] })
      .then(async response => {
        if (response.error) return;

        for (const keys of response.result) {
          try {
            $userPublicKeys.push({
              userId: keys.userId,
              ...(await importUserPublicKeys(keys))
            });
          } catch {}
        }
      });

  const uploadImages = useState(async (images: SelectedImage[], albumId: string, encrypt: boolean) => {});
  const openImageSelect = useState(() => {});

  const isLoading = useState(false);

  const imagesDiv = useState(null as HTMLDivElement | null);
  const pageDiv = useState(null as HTMLDivElement | null);

  const shouldLoadMore = useState(true);

  const groupedImages = useState([] as ImageGroup[]);
  const openedImageIndex = useState(-1);

  const openedImage = useComputed<Image | null>(() => {
    let i = $openedImageIndex;

    for (const group of $groupedImages) {
      if (i < group.images.length) return group.images[i] ?? null;
      i -= group.images.length;
    }

    return null;
  });

  const imageCount = useComputed<number>(() => {
    let count = 0;
    for (const group of $groupedImages) count += group.images.length;
    return count;
  });

  const loadImages = async () => {
    if ($isLoading || !$shouldLoadMore) return;
    $isLoading = true;

    const response = await apiService.send(requests.image.getImages, {
      albumId: $album?.id ?? '',
      filters: {
        from: $hasFilters.from ? new Date($filters.from) : null,
        upTo: $hasFilters.upTo ? new Date($filters.upTo) : null
      },
      skip: $imageCount
    });

    if (response.error == null)
      for (const image of response.result) {
        loadPreviewSource(image);
        insertImageReversed(image);
      }

    if (response.error != null || response.result.length < 10) $shouldLoadMore = false;

    $isLoading = false;
  };

  loadImages();

  useEffect(() => {
    if ($pageDiv == null || $imagesDiv == null) return;

    const mutationObserver = new MutationObserver(() => {
      if ($imagesDiv!.clientHeight >= $pageDiv!.clientHeight) return;
      loadImages();
    });

    mutationObserver.observe($imagesDiv!, { childList: true, subtree: true });

    return () => mutationObserver.disconnect();
  });

  const onScroll = () => {
    if ($pageDiv == null) return;
    if ($pageDiv!.scrollTop + 10 < $pageDiv!.scrollHeight - $pageDiv!.clientHeight) return;

    loadImages();
  };

  const getImageIndex = (image: Image) => {
    let index = 0;

    for (const group of $groupedImages) {
      if (group.images.includes(image)) return index + group.images.indexOf(image);
      index += group.images.length;
    }

    return index;
  };

  const previewSources = useState({} as Record<string, string | null>);
  const sources = useState({} as Record<string, string | null>);
  const blobs = useState({} as Record<string, Blob | null>);

  const isDownloading = useState(false);

  const download = async () => {
    if ($openedImage == null || $isDownloading) return;
    const image = $openedImage!;
    $isDownloading = true;

    let href = $sources[image.id];
    let blob = $blobs[image.id];

    if (!image.isEncrypted) {
      blob = await b2Service.downloadAsBlob('pixer-images', `${image.albumId}/${image.id}`);
      if (blob == null) {
        $isDownloading = false;
        return;
      }

      const blobHref = URL.createObjectURL(blob);
      setTimeout(() => URL.revokeObjectURL(blobHref), 60 * 1000);

      href = blobHref;
    }

    if (!Capacitor.isNativePlatform()) {
      if (href == null) {
        $isDownloading = false;
        return;
      }

      const link = document.createElement('a');
      link.target = '_blank';
      link.href = href;
      link.download = `${image.id}.${image.imageExt}`;

      link.click();
    } else {
      if (blob == null) {
        $isDownloading = false;
        return;
      }

      const albumName = `${$album?.name} (PiXer)`;

      try {
        await Media.createAlbum({ name: albumName });
      } catch {}

      const { albums } = await Media.getAlbums();

      const deviceAlbum = albums.find(album => album.name === albumName);
      if (deviceAlbum == null) return;

      const fileReader = new FileReader();

      fileReader.onload = async () => {
        if (typeof fileReader.result !== 'string') return;

        await Media.savePhoto({
          path: fileReader.result,
          albumIdentifier: deviceAlbum.identifier,
          fileName: image.id
        });

        Toast.show({
          text: 'Photo saved',
          duration: 'short',
          position: 'top'
        });
      };

      fileReader.readAsDataURL(blob);
    }

    $isDownloading = false;
  };

  useEffect(() => {
    if ($openedImageIndex < $imageCount - 1) return;

    loadImages();
  });

  const hasImageControls = useState(true);

  const isDeletingImage = useState(false);
  const isDeleteOpen = useState(false);

  const deleteImage = async () => {
    if ($isDeletingImage || $openedImage == null) return;
    $isDeletingImage = true;

    const response = await apiService.send(requests.image.deleteImage, {
      imageId: $openedImage!.id
    });

    if (response.error == null && response.result === true) {
      const id = $openedImage!.id;

      removeImage($openedImage!);
      if ($openedImageIndex >= $imageCount) $openedImageIndex--;

      if ($previewSources[id] != null) URL.revokeObjectURL($previewSources[id]!);
      delete $previewSources[id];

      if ($sources[id] != null) URL.revokeObjectURL($sources[id]!);
      delete $sources[id];
      delete $blobs[id];
    }

    $isDeletingImage = false;
    $isDeleteOpen = false;
  };

  const insertImage = (image: Image) => {
    image = makeReactive(image);

    const date = image.imageDate.getDate();
    const month = image.imageDate.getMonth();
    const year = image.imageDate.getFullYear();

    let i = 0;

    for (const group of $groupedImages) {
      if (group.date === date && group.month === month && group.year === year) {
        const images = group.images;

        let j = 0;

        for (const img of images) {
          if (img.imageDate.getTime() < image.imageDate.getTime()) break;
          j++;
        }

        images.splice(j, 0, image);

        return;
      }

      if (group.year < year) break;
      if (group.year === year && group.month < month) break;
      if (group.year === year && group.month === month && group.date < date) break;

      i++;
    }

    $groupedImages.splice(i, 0, { year, month, date, images: [image] });
  };

  const insertImageReversed = (image: Image) => {
    image = makeReactive(image);

    const date = image.imageDate.getDate();
    const month = image.imageDate.getMonth();
    const year = image.imageDate.getFullYear();

    let i = $groupedImages.length - 1;

    for (; i >= 0; i--) {
      const group = $groupedImages[i];

      if (group.date === date && group.month === month && group.year === year) {
        const images = group.images;

        let j = images.length - 1;

        for (; j >= 0; j--) {
          const img = images[j];
          if (img.imageDate.getTime() > image.imageDate.getTime()) break;
        }

        images.splice(j + 1, 0, image);

        return;
      }

      if (group.year > year) break;
      if (group.year === year && group.month > month) break;
      if (group.year === year && group.month === month && group.date > date) break;
    }

    $groupedImages.splice(i + 1, 0, { year, month, date, images: [image] });
  };

  const removeImage = (image: Image) => {
    for (const group of $groupedImages) {
      if (!group.images.includes(image)) continue;
      group.images.splice(group.images.indexOf(image), 1);

      if (group.images.length === 0) $groupedImages.splice($groupedImages.indexOf(group), 1);

      break;
    }
  };

  const loadPreviewSource = async (image: Image) => {
    if (image.id in $previewSources) return;
    $previewSources[image.id] = null;

    if (!image.isEncrypted) {
      $previewSources[image.id] = b2Service.imagePreview($album?.id ?? '', image.id);
      return;
    }

    if (image.key == null) return;

    const aesKey = await importAESKey(image.key.encryptedKey, authService.keys!.encryptionKey.privateKey);
    const aesIv = await rsaDecrypt(authService.keys!.encryptionKey.privateKey, image.key.encryptedIv);

    const encryptedPreviewData = await b2Service.downloadAsArrayBuffer(
      'image-previews',
      `${$album?.id ?? ''}/${image.id}`
    );

    if (encryptedPreviewData == null) return;

    const decryptedPreviewData = await aesDecrypt(aesKey, aesIv, encryptedPreviewData);

    const previewBlob = new Blob([decryptedPreviewData], { type: 'image/png' });
    $previewSources[image.id] = URL.createObjectURL(previewBlob);
  };

  useCleanup(() => {
    for (const key in $previewSources) if ($previewSources[key] != null) URL.revokeObjectURL($previewSources[key]!);
    for (const key in $sources) if ($sources[key] != null) URL.revokeObjectURL($sources[key]!);
  });

  useEffect(() => {
    const image = $openedImage;
    if (image == null) return;

    runWithoutTracking(async () => {
      if (image.id in $sources) return;
      $sources[image.id] = null;

      if (!image.isEncrypted) {
        $sources[image.id] = b2Service.image($album?.id ?? '', image.id);
        return;
      }

      if (image.key == null) return;

      const aesKey = await importAESKey(image.key.encryptedKey, authService.keys!.encryptionKey.privateKey);
      const aesIv = await rsaDecrypt(authService.keys!.encryptionKey.privateKey, image.key.encryptedIv);

      const encryptedImageData = await b2Service.downloadAsArrayBuffer(
        'pixer-images',
        `${$album?.id ?? ''}/${image.id}`
      );

      if (encryptedImageData == null) return;

      const decryptedImageData = await aesDecrypt(aesKey, aesIv, encryptedImageData);

      const imageBlob = new Blob([decryptedImageData], { type: image.imageType });
      $sources[image.id] = URL.createObjectURL(imageBlob);
      $blobs[image.id] = imageBlob;
    });
  });

  useEffect(
    createReactiveCallback(
      () => ($hasFilters.from, $hasFilters.upTo, $filters.from, $filters.upTo),
      () => {
        $openedImageIndex = -1;
        $groupedImages = [];

        $shouldLoadMore = true;
        loadImages();
      }
    )
  );

  return html`
    ${ImageUpload({
      userPublicKeys,
      onImageUploaded: image => (loadPreviewSource(image), insertImage(image)),
      uploadImages
    })}
    ${ImageSelect({
      open: openImageSelect,
      onImagesSelected: images => $album && $uploadImages(images, $album!.id, $album!.type === AlbumType.PRIVATE),
      maxImages: 10
    })}

    <div
      @click=${() => ($hasImageControls = !$hasImageControls)}
      class="absolute top-0 left-0 w-screen h-screen bg-black z-50"
      .hidden=${$openedImage == null}>
      <img
        .hidden=${$openedImage == null || $sources[$openedImage!.id] == null}
        class="top-0 left-0 w-full h-full object-contain object-center"
        src=${$sources[$openedImage?.id ?? '']} />

      <div
        .hidden=${!$hasImageControls}
        @click:stopPropagation=${() => !$isDeletingImage && ($openedImageIndex = -1)}
        class="fixed bg-white shadow-md rounded-full top-2 left-2 w-9 h-9 grid place-items-center cursor-pointer">
        ${Icon({
          icon: faArrowLeft,
          fill: '#9ca3af',
          classes: 'w-5'
        })}
      </div>

      <div class="fixed top-2 right-2 flex gap-2" .hidden=${!$hasImageControls}>
        <if
          ${$album?.creator?.username === authService.user?.username ||
          ($isCollaborator && $openedImage?.creator?.username === authService.user?.username)}>
          <div
            @click:stopPropagation=${() => ($isDeleteOpen = true)}
            class="bg-white shadow-md rounded-full w-9 h-9 grid place-items-center cursor-pointer">
            ${Icon({
              icon: faTrash,
              fill: '#ef4444',
              classes: 'w-5'
            })}
          </div>
        </if>

        <if ${$openedImage?.wasSubmission}>
          <div class="bg-white shadow-md rounded-full w-9 h-9 grid place-items-center">
            ${Icon({
              icon: faInbox,
              fill: '#9ca3af',
              classes: 'w-6'
            })}
          </div>
        </if>

        <div class="bg-white shadow-md rounded-full w-9 h-9 grid place-items-center">
          ${Icon({
            icon: () => ($album?.type === AlbumType.PRIVATE ? faLock : faUnlock),
            fill: () => ($album?.type === AlbumType.PRIVATE ? '#3b82f6' : '#9ca3af'),
            classes: 'w-5'
          })}
        </div>

        <div
          @click:stopPropagation=${download}
          class="bg-white shadow-md rounded-full w-9 h-9 grid place-items-center cursor-pointer">
          ${Icon({
            icon: faFileArrowDown,
            fill: '#9ca3af',
            classes: 'w-4'
          })}
        </div>
      </div>

      <div
        .hidden=${$openedImageIndex <= 0 || !$hasImageControls}
        @click:stopPropagation=${() => !$isDeletingImage && $openedImageIndex--}
        class="fixed bg-white shadow-md rounded-full top-1/2 left-2 w-10 h-10 grid place-items-center cursor-pointer -translate-y-1/2">
        ${Icon({
          icon: faCaretLeft,
          fill: '#9ca3af',
          classes: 'w-4'
        })}
      </div>

      <div
        .hidden=${$openedImageIndex >= $imageCount - 1 || !$hasImageControls}
        @click:stopPropagation=${() => !$isDeletingImage && $openedImageIndex++}
        class="fixed bg-white shadow-md rounded-full top-1/2 right-2 w-10 h-10 grid place-items-center cursor-pointer -translate-y-1/2">
        ${Icon({
          icon: faCaretRight,
          fill: '#9ca3af',
          classes: 'w-4'
        })}
      </div>

      <div
        .hidden=${!$hasImageControls}
        @click=${() => navigate({ route: 'user', params: { username: $openedImage?.creator?.username ?? '' } })}
        class="shadow-md cursor-pointer fixed bg-white bottom-0 left-0 flex items-center gap-4 pl-3 pr-5 py-3 rounded-tr-xl">
        ${ProfileIcon({
          userId: () => $openedImage?.creator?.id ?? null,
          fullSize: true,
          classes: 'w-16'
        })}

        <div class="flex flex-col gap-1">
          <p class="text-gray-700 text-xl font-bold">${$openedImage?.creator?.username}</p>

          <p class="text-gray-400 text-lg">
            ${$openedImage
              ? `${formatDateAlt($openedImage!.imageDate, l)} ${formatTime($openedImage!.imageDate)}`
              : '??/??/??'}
          </p>
        </div>
      </div>
    </div>

    <div
      @click=${() => ($isDeleteOpen = false)}
      .hidden=${!$isDeleteOpen}
      class="p-5 fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 grid place-items-center">
      <div
        class="bg-white rounded-lg p-4 w-[80vw] max-w-[350px] flex flex-col gap-6"
        @click:stopPropagation=${() => {}}>
        <p class="text-xl">${l('album.view.images.delete.title')}</p>

        <div class="flex gap-4">
          <div
            class="cursor-pointer bg-red-500 rounded-lg text-lg text-white py-1 px-4 font-bold text-center"
            .opacity-75=${$isLoading}
            @click=${deleteImage}>
            ${l('album.view.edit.delete.delete')}
          </div>

          <div
            @click=${() => ($isDeleteOpen = false)}
            class="cursor-pointer bg-gray-400 rounded-lg text-lg text-white py-1 px-4 font-bold text-center">
            ${l('album.view.edit.delete.cancel')}
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow flex flex-col w-full overflow-y-auto" :this=${$pageDiv} @scroll=${onScroll}>
      <div class="flex items-center gap-2 px-2 pt-4 pb-1">
        <div
          class="flex items-center rounded-full bg-gray-200 text-gray-700 w-fit gap-1 shadow-sm cursor-pointer relative px-3"
          @click=${() => $fromFilterInput!.showPicker()}>
          <div
            @click=${(e: MouseEvent) => (e.stopPropagation(), ($hasFilters.from = false))}
            class=${`z-50 inline ${$hasFilters.from ? '' : 'hidden'}`}>
            ${Icon({
              icon: faXmark,
              fill: 'rgb(55 65 81)',
              classes: 'w-3 -translate-y-[1px]'
            })}
          </div>

          ${l('date.from')} ${$hasFilters.from ? ':' : ''}

          <span class="font-bold" .hidden=${!$hasFilters.from}> ${formatDate(new Date($filters.from))} </span>

          <input
            class="opacity-0 absolute top-0 left-0"
            type="date"
            :this=${$fromFilterInput}
            :valueAsNumber#=${$filters.from}
            @change=${() => ($hasFilters.from = true)}
            max=${formatDateInput($hasFilters.upTo ? new Date($filters.upTo) : new Date())} />
        </div>

        <div
          class="flex items-center rounded-full bg-gray-200 text-gray-700 w-fit gap-1 shadow-sm cursor-pointer relative px-3"
          @click=${() => $upToFilterInput!.showPicker()}>
          <div
            @click=${(e: MouseEvent) => (e.stopPropagation(), ($hasFilters.upTo = false))}
            class=${`z-50 inline ${$hasFilters.upTo ? '' : 'hidden'}`}>
            ${Icon({
              icon: faXmark,
              fill: 'rgb(55 65 81)',
              classes: 'w-3 -translate-y-[1px]'
            })}
          </div>

          ${l('date.upTo')} ${$hasFilters.upTo ? ':' : ''}

          <span class="font-bold" .hidden=${!$hasFilters.upTo}> ${formatDate(new Date($filters.upTo))} </span>

          <input
            class="opacity-0 absolute top-0 left-0"
            type="date"
            :this=${$upToFilterInput}
            :valueAsNumber#=${$filters.upTo}
            @change=${() => ($hasFilters.upTo = true)}
            max=${formatDateInput(new Date())}
            min=${$hasFilters.from ? formatDateInput(new Date($filters.from)) : undefined} />
        </div>
      </div>

      <if ${!$isLoading && $imageCount === 0}>
        <p class="text-gray-400 text-lg text-center mt-3">${l('album.view.images.noImages')}</p>
      </if>

      <div class="flex flex-col" :this=${$imagesDiv}>
        <each ${$groupedImages} indexed>
          ${(group: ValueNode<ImageGroup>) => html`
            <p class="text-lg border-gray-400 w-fit ml-2 mb-1 mt-2">
              ${$group?.date ?? 0} ${l(MonthTranslationKeys[$group?.month ?? 0])} ${$group?.year ?? 0}
            </p>

            <div class="flex flex-row flex-wrap">
              <each ${$group?.images ?? []} indexed>
                ${(image: ValueNode<Image>) =>
                  html`
                    <div
                      @click=${() => (($openedImageIndex = getImageIndex($image)), ($hasImageControls = true))}
                      class="relative cursor-pointer w-[25vw] h-[25vw] md:w-24 md:h-24 bg-gray-200 border-white border-[1px]">
                      <img
                        .hidden=${$previewSources[$image.id] == null}
                        class="object-cover w-full h-full"
                        src=${$previewSources[$image.id]} />
                    </div>
                  `}
              </each>
            </div>
          `}
        </each>
      </div>

      <if ${$isLoading}>
        <p class="text-gray-400 text-lg text-center mt-3">${l('loading')}</p>
      </if>

      <div class="fixed bottom-4 right-4 flex gap-2">
        <if ${$album?.allowSubmissions}>
          <div
            class="w-12 h-12 rounded-full bg-white grid place-items-center border-2 border-gray-400 shadow-xl cursor-pointer"
            @click=${() => navigate({ route: 'album.view.submissions', params: $route.params })}>
            ${Icon({
              icon: faInbox,
              fill: '#3b82f6',
              classes: 'w-7'
            })}
          </div>
        </if>

        <if ${$isCollaborator}>
          <div
            class="w-12 h-12 rounded-full bg-white grid place-items-center border-2 border-gray-400 shadow-xl cursor-pointer"
            @click=${() => $openImageSelect()}>
            ${Icon({
              icon: faArrowUpFromBracket,
              fill: '#3b82f6',
              classes: 'h-7'
            })}
          </div>
        </if>
      </div>
    </div>
  `;
});

export default AlbumImagesPageComponent;
