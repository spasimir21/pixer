import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents, useComputed, useEffect, useState } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useAlbum } from '../../../context/AlbumContext';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';
import { IconComponent } from '../../../components/Icon';
import {
  faArrowDown,
  faArrowLeft,
  faArrowUpFromBracket,
  faCaretLeft,
  faCaretRight,
  faCheck,
  faFileArrowDown,
  faInbox,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { useService } from '@lib/service';
import { toHex } from '@lib/utils/hex';
import { ImageSelectComponent, SelectedImage } from '../../../components/image/ImageSelect';
import { SubmissionUploadComponent } from '../../../components/image/SubmissionUpload';
import { Submission } from '@api/dto/submission';
import { APIServiceManager } from '../../../service/APIService';
import { requests } from '../../../api/requests';
import { B2ServiceManager } from '../../../service/B2Service';
import { formatDate } from '../../../misc/date';
import { ProfileIconComponent } from '../../../components/ProfileIcon/ProfileIcon';
import { ValueNode } from '@lib/reactivity';

const AlbumSubmissionsPageComponent = Component((): UINode => {
  const [Icon, ProfileIcon, ImageSelect, SubmissionUpload] = useChildComponents(
    IconComponent,
    ProfileIconComponent,
    ImageSelectComponent,
    SubmissionUploadComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const b2Service = useService(B2ServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  const album = useAlbum();

  const isJudge = useComputed(() => {
    if (authService.user == null || $album == null) return false;
    const userId = toHex(authService.user.id);
    return toHex($album!.creator.id) === userId || $album!.users.map(({ id }) => toHex(id)).includes(userId);
  });

  useEffect(() => {
    if ($album?.allowSubmissions !== true) navigate({ route: 'album.view.images', params: $route.params }, true);
  });

  const uploadSubmissions = useState(async (images: SelectedImage[], albumId: string) => {});
  const openImageSelect = useState(() => {});

  const submissions = useState([] as Submission[]);
  const isLoading = useState(false);

  const imagesDiv = useState(null as HTMLDivElement | null);
  const pageDiv = useState(null as HTMLDivElement | null);

  const shouldLoadMore = useState(true);

  const loadImages = async () => {
    if ($isLoading || !$shouldLoadMore) return;
    $isLoading = true;

    const response = await apiService.send(
      $isJudge ? requests.submission.getSubmissions : requests.submission.getOwnSubmissions,
      { albumId: $album?.id ?? '', skip: $submissions.length } as any
    );

    $submissions.push(...(response.result ?? []));
    $isLoading = false;

    if (response.error != null || response.result.length < 10) $shouldLoadMore = false;
  };

  loadImages();

  useEffect(() => {
    if ($pageDiv == null || $imagesDiv == null || !$isJudge) return;

    const mutationObserver = new MutationObserver(() => {
      if ($imagesDiv!.clientHeight >= $pageDiv!.clientHeight) return;
      loadImages();
    });

    mutationObserver.observe($imagesDiv!, { childList: true });

    return () => mutationObserver.disconnect();
  });

  const onScroll = () => {
    if (!$isJudge || $pageDiv == null) return;
    if ($pageDiv!.scrollTop + 10 < $pageDiv!.scrollHeight - $pageDiv!.clientHeight) return;

    loadImages();
  };

  const openedSubmissionIndex = useState(-1);

  const openedSubmission = useComputed<Submission | null>(() => $submissions[$openedSubmissionIndex] ?? null);

  useEffect(() => {
    if ($openedSubmissionIndex < $submissions.length - 1 || !$isJudge) return;
    loadImages();
  });

  const download = () => {
    if ($openedSubmission == null) return;

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', b2Service.image($openedSubmission!.albumId, $openedSubmission!.id));
    link.setAttribute('download', `${$openedSubmission!.id}.${$openedSubmission!.imageExt}`);

    link.click();
  };

  const hasImageControls = useState(true);

  const isDoingSubmissionWork = useState(false);

  const manageSubmission = async (accept: boolean) => {
    if ($isDoingSubmissionWork || $openedSubmission == null) return;
    $isDoingSubmissionWork = true;

    const response = await apiService.send(
      accept ? requests.submission.acceptSubmission : requests.submission.rejectSubmission,
      {
        submissionId: $openedSubmission!.id
      }
    );

    if (response.error == null && response.result === true) {
      $submissions.splice($openedSubmissionIndex, 1);
      if ($openedSubmissionIndex >= $submissions.length - 1) $openedSubmissionIndex--;
    }

    $isDoingSubmissionWork = false;
  };

  return html`
    ${SubmissionUpload({
      uploadSubmissions,
      onSubmissionUploaded: submission => $submissions.unshift(submission)
    })}
    ${ImageSelect({
      open: openImageSelect,
      onImagesSelected: images => $uploadSubmissions(images, $album?.id ?? ''),
      maxImages: 10
    })}

    <div
      @click=${() => ($hasImageControls = !$hasImageControls)}
      class="absolute top-0 left-0 w-screen h-screen bg-black z-50"
      .hidden=${$openedSubmission == null}>
      <img
        class="top-0 left-0 w-full h-full object-contain object-center"
        src=${$openedSubmission ? b2Service.image($openedSubmission!.albumId, $openedSubmission!.id) : ''} />

      <div class="fixed top-2 left-1/2 -translate-x-1/2 flex gap-2" .hidden=${!$hasImageControls}>
        <if ${$isJudge}>
          <div
            @click:stopPropagation=${() => manageSubmission(true)}
            class="bg-green-500 shadow-md rounded-full w-9 h-9 grid place-items-center cursor-pointer">
            ${Icon({
              icon: faCheck,
              fill: 'white',
              classes: 'w-5'
            })}
          </div>
        </if>

        <div
          @click:stopPropagation=${() => manageSubmission(false)}
          class="bg-red-500 shadow-md rounded-full w-9 h-9 grid place-items-center cursor-pointer">
          ${Icon({
            icon: faXmark,
            fill: 'white',
            classes: 'w-5'
          })}
        </div>
      </div>

      <div
        .hidden=${!$hasImageControls}
        @click:stopPropagation=${() => !$isDoingSubmissionWork && ($openedSubmissionIndex = -1)}
        class="fixed bg-white shadow-md rounded-full top-2 left-2 w-9 h-9 grid place-items-center cursor-pointer">
        ${Icon({
          icon: faArrowLeft,
          fill: '#9ca3af',
          classes: 'w-5'
        })}
      </div>

      <div
        .hidden=${!$hasImageControls}
        @click:stopPropagation=${download}
        class="fixed bg-white shadow-md rounded-full top-2 right-2 w-9 h-9 grid place-items-center cursor-pointer">
        ${Icon({
          icon: faFileArrowDown,
          fill: '#9ca3af',
          classes: 'w-4'
        })}
      </div>

      <div
        .hidden=${$openedSubmissionIndex <= 0 || !$hasImageControls}
        @click:stopPropagation=${() => !$isDoingSubmissionWork && $openedSubmissionIndex--}
        class="fixed bg-white shadow-md rounded-full top-1/2 left-2 w-10 h-10 grid place-items-center cursor-pointer -translate-y-1/2">
        ${Icon({
          icon: faCaretLeft,
          fill: '#9ca3af',
          classes: 'w-4'
        })}
      </div>

      <div
        .hidden=${$openedSubmissionIndex >= $submissions.length - 1 || !$hasImageControls}
        @click:stopPropagation=${() => !$isDoingSubmissionWork && $openedSubmissionIndex++}
        class="fixed bg-white shadow-md rounded-full top-1/2 right-2 w-10 h-10 grid place-items-center cursor-pointer -translate-y-1/2">
        ${Icon({
          icon: faCaretRight,
          fill: '#9ca3af',
          classes: 'w-4'
        })}
      </div>

      <div
        .hidden=${!$hasImageControls}
        @click=${() => navigate({ route: 'user', params: { username: $openedSubmission?.creator?.username ?? '' } })}
        class="shadow-md cursor-pointer fixed bg-white bottom-0 left-0 flex items-center gap-4 pl-3 pr-5 py-3 rounded-tr-xl">
        ${ProfileIcon({
          userId: () => $openedSubmission?.creator?.id ?? null,
          fullSize: true,
          classes: 'w-16'
        })}

        <div class="flex flex-col gap-1">
          <p class="text-gray-700 text-xl font-bold">${$openedSubmission?.creator?.username}</p>

          <p class="text-gray-400 text-lg">
            ${$openedSubmission ? formatDate($openedSubmission!.imageDate) : '??/??/??'}
          </p>
        </div>
      </div>
    </div>

    <div class="flex-grow flex flex-col w-full overflow-y-auto" :this=${$pageDiv} @scroll=${onScroll}>
      <if ${!$isLoading && $submissions.length === 0}>
        <p class="text-gray-400 text-lg text-center mt-3">${l('album.view.submissions.noSubmissions')}</p>
      </if>

      <div class="flex flex-row flex-wrap" :this=${$imagesDiv}>
        <each ${$submissions}>
          ${(submission: Submission, index: ValueNode<number>) =>
            html`
              <img
                class="cursor-pointer w-[25vw] h-[25vw] md:w-24 md:h-24 bg-gray-200 object-cover border-white border-[1px]"
                src=${b2Service.imagePreview(submission.albumId, submission.id)}
                @click=${() => (($openedSubmissionIndex = $index), ($hasImageControls = true))} />
            `}
        </each>
      </div>

      <if ${$isLoading}>
        <p class="text-gray-400 text-lg text-center mt-3">${l('loading')}</p>
      </if>

      <div class="fixed bottom-4 right-4 flex gap-2">
        <if ${!$isJudge}>
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

export default AlbumSubmissionsPageComponent;
