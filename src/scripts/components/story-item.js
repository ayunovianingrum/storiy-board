import { html } from '../utils/html';
import { showFormattedDate } from '../utils';

export default function StoryItem(item) {
  const { placeName, name, description, createdAt, photoUrl, id } = item;

  return html`<article
    class="relative flex flex-col gap-3 rounded-[28px] bg-white bg-cover bg-center p-4 transition"
    style="background-image: url('${photoUrl}')"
  >
    <div
      class="absolute inset-0 z-10 rounded-[28px] bg-linear-to-t from-black/30 to-transparent backdrop-blur-xl"
      style="-webkit-mask-image: linear-gradient(to top, black 30%, transparent 100%); mask-image: linear-gradient(to top, black 30%, transparent 100%);"
    ></div>
    <div class="z-20 flex min-h-62.5 items-start rounded-3xl">
      <p
        class="bg-grey-60/30 max-w-50 truncate rounded-full px-4 py-2 text-xs text-white backdrop-blur-xl"
      >
        <i class="fas fa-md fa-map-marker-alt mr-1 text-white"></i>
        ${placeName ?? 'Unknown Location'}
      </p>
    </div>
    <div class="z-20 flex flex-1 flex-col justify-between">
      <div class="pb-5">
        <h2 class="truncate text-xl font-medium text-white">${name}</h2>
        <p class="text-grey-50 my-1 text-xs font-light">
          <i class="fas fa-md fa-calendar mr-1"></i>
          ${showFormattedDate(createdAt, 'id-ID')}
        </p>
        <p class="text-grey-20 line-clamp-3 text-sm font-light">
          ${description}
        </p>
      </div>
      <app-button
        data-id="${id}"
        custom-class="text-xs! w-fit px-4! py-2! text-white! border-white! hover:bg-white/30!"
        class="read-more-btn"
        label="Read More"
        right-icon="<i class='fas fa-sm fa-chevron-down -rotate-90 ml-2'></i>"
        variant="secondary"
      ></app-button>
    </div>
  </article>`;
}
