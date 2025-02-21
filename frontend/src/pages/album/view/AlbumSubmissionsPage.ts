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
import { formatDate, formatDateAlt, formatTime, MonthTranslationKeys } from '../../../misc/date';
import { ProfileIconComponent } from '../../../components/ProfileIcon/ProfileIcon';
import { makeReactive, ValueNode } from '@lib/reactivity';

interface SubmissionGroup {
  date: number;
  month: number;
  year: number;
  submissions: Submission[];
}

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

  const isLoading = useState(false);

  const imagesDiv = useState(null as HTMLDivElement | null);
  const pageDiv = useState(null as HTMLDivElement | null);

  const shouldLoadMore = useState(true);

  const groupedSubmissions = useState([] as SubmissionGroup[]);
  const openedSubmissionIndex = useState(-1);

  const openedSubmission = useComputed<Submission | null>(() => {
    let i = $openedSubmissionIndex;

    for (const group of $groupedSubmissions) {
      if (i < group.submissions.length) return group.submissions[i] ?? null;
      i -= group.submissions.length;
    }

    return null;
  });

  const submissionCount = useComputed<number>(() => {
    let count = 0;
    for (const group of $groupedSubmissions) count += group.submissions.length;
    return count;
  });

  const loadImages = async () => {
    if ($isLoading || !$shouldLoadMore) return;
    $isLoading = true;

    const response = await apiService.send(requests.submission.getSubmissions, {
      albumId: $album?.id ?? '',
      skip: $submissionCount
    });

    if (response.error == null) for (const submission of response.result) insertSubmissionReversed(submission);

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

  const getSubmissionIndex = (submission: Submission) => {
    let index = 0;

    for (const group of $groupedSubmissions) {
      if (group.submissions.includes(submission)) return index + group.submissions.indexOf(submission);
      index += group.submissions.length;
    }

    return index;
  };

  useEffect(() => {
    if ($openedSubmissionIndex < $submissionCount - 1) return;

    loadImages();
  });

  const download = async () => {
    if ($openedSubmission == null) return;

    const blob = await b2Service.downloadAsBlob(
      'pixer-images',
      `${$openedSubmission!.albumId}/${$openedSubmission!.id}`
    );

    if (blob == null) return;

    const blobHref = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(blobHref), 60 * 1000);

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = blobHref;
    link.download = `${$openedSubmission!.id}.${$openedSubmission!.imageExt}`;

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
      removeSubmission($openedSubmission!);
      if ($openedSubmissionIndex >= $submissionCount - 1) $openedSubmissionIndex--;
    }

    $isDoingSubmissionWork = false;
  };

  const insertSubmission = (submission: Submission) => {
    submission = makeReactive(submission);

    const date = submission.uploadedAt.getDate();
    const month = submission.uploadedAt.getMonth();
    const year = submission.uploadedAt.getFullYear();

    let i = 0;

    for (const group of $groupedSubmissions) {
      if (group.date === date && group.month === month && group.year === year) {
        const submissions = group.submissions;

        let j = 0;

        for (const sub of submissions) {
          if (sub.uploadedAt.getTime() < submission.uploadedAt.getTime()) break;
          j++;
        }

        submissions.splice(j, 0, submission);

        return;
      }

      if (group.year < year) break;
      if (group.year === year && group.month < month) break;
      if (group.year === year && group.month === month && group.date < date) break;

      i++;
    }

    $groupedSubmissions.splice(i, 0, { year, month, date, submissions: [submission] });
  };

  const insertSubmissionReversed = (submission: Submission) => {
    submission = makeReactive(submission);

    const date = submission.uploadedAt.getDate();
    const month = submission.uploadedAt.getMonth();
    const year = submission.uploadedAt.getFullYear();

    let i = $groupedSubmissions.length - 1;

    for (; i >= 0; i--) {
      const group = $groupedSubmissions[i];

      if (group.date === date && group.month === month && group.year === year) {
        const submissions = group.submissions;

        let j = submissions.length - 1;

        for (; j >= 0; j--) {
          const sub = submissions[j];
          if (sub.uploadedAt.getTime() > submission.uploadedAt.getTime()) break;
        }

        submissions.splice(j + 1, 0, submission);

        return;
      }

      if (group.year > year) break;
      if (group.year === year && group.month > month) break;
      if (group.year === year && group.month === month && group.date > date) break;
    }

    $groupedSubmissions.splice(i + 1, 0, { year, month, date, submissions: [submission] });
  };

  const removeSubmission = (submission: Submission) => {
    for (const group of $groupedSubmissions) {
      if (!group.submissions.includes(submission)) continue;
      group.submissions.splice(group.submissions.indexOf(submission), 1);

      if (group.submissions.length === 0) $groupedSubmissions.splice($groupedSubmissions.indexOf(group), 1);

      break;
    }
  };

  return html`
    ${SubmissionUpload({
      uploadSubmissions,
      onSubmissionUploaded: insertSubmission
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
        .hidden=${$openedSubmissionIndex >= $submissionCount - 1 || !$hasImageControls}
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
            ${$openedSubmission
              ? `${formatDateAlt($openedSubmission!.imageDate, l)} ${formatTime($openedSubmission!.imageDate)}`
              : '??/??/??'}
          </p>
        </div>
      </div>
    </div>

    <div class="flex-grow flex flex-col w-full overflow-y-auto" :this=${$pageDiv} @scroll=${onScroll}>
      <if ${!$isLoading && $submissionCount === 0}>
        <p class="text-gray-400 text-lg text-center mt-3">${l('album.view.submissions.noSubmissions')}</p>
      </if>

      <div class="flex flex-col" :this=${$imagesDiv}>
        <each ${$groupedSubmissions} indexed>
          ${(group: ValueNode<SubmissionGroup>) => html`
            <p class="text-lg border-gray-400 w-fit ml-2 mb-1 mt-2">
              ${$group?.date ?? 0} ${l(MonthTranslationKeys[$group?.month ?? 0])} ${$group?.year ?? 0}
            </p>

            <div class="flex flex-row flex-wrap">
              <each ${$group?.submissions ?? []} indexed>
                ${(submission: ValueNode<Submission>) =>
                  html`
                    <img
                      class="cursor-pointer w-[25vw] h-[25vw] md:w-24 md:h-24 bg-gray-200 object-cover border-white border-[1px]"
                      src=${b2Service.imagePreview($submission?.albumId ?? '', $submission?.id ?? '')}
                      @click=${() => (
                        ($openedSubmissionIndex = getSubmissionIndex($submission)), ($hasImageControls = true)
                      )} />
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
