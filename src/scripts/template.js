import { capitalize, showFormattedDate } from './utils';

export function loginForm() {
  return `
    <section class="h-max" id="login-form-wrapper">
      <h1 class="mb-8 text-4xl font-medium">Login</h1>
      <form id="login-form">
        <div>
          <label for="email-login-input" class="cs-label">Email</label>
          <input
            id="email-login-input"
            class="cs-input"
            type="email"
            name="email"
            placeholder="Ex: story@gmail.com"
            required
            aria-describedby="email-error"
          />
          <p id="email-error" class="cs-err-message"></p>
        </div>
        <div>
          <label for="password-login-input" class="cs-label"> Password </label>
          <input
            id="password-login-input"
            class="cs-input"
            type="password"
            name="password"
            placeholder="Type your password here.."
            required
            aria-describedby="password-error"
          />
          <p id="password-error" class="cs-err-message"></p>
        </div>
        <app-button
          id="submit-btn"
          type="submit"
          label="Login Now"
          custom-class="mt-10 w-full"
        ></app-button>
      </form>
      <p class="text-grey-90 mt-3 text-center text-xs">
        Don't have account yet?
        <strong>
          <a
            class="text-medium text-primary-60 register-btn cursor-pointer"
            href="#/register"
          >
            Register
          </a>
        </strong>
      </p>
    </section>
  `;
}

export function registerForm() {
  return `
    <section class="h-max" id="register-form-wrapper">
      <h1 class="mb-8 text-4xl font-medium">Register</h1>
      <form id="register-form">
        <div>
          <label for="fullname-input" class="cs-label">Full Name</label>
          <input
            id="fullname-input"
            class="cs-input"
            type="text"
            name="fullname"
            placeholder="Type your name here.."
            required
            aria-describedby="name-reg-error"
          />
          <p id="name-reg-error" class="cs-err-message"></p>
        </div>
        <div>
          <label for="email-register-input" class="cs-label">Email</label>
          <input
            id="email-register-input"
            class="cs-input"
            type="email"
            name="email"
            placeholder="Ex: story@gmail.com"
            required
            aria-describedby="email-reg-error"
          />
          <p id="email-reg-error" class="cs-err-message"></p>
        </div>
        <div>
          <label for="password-register-input" class="cs-label">Password</label>
          <input
            id="password-register-input"
            class="cs-input"
            type="password"
            name="password"
            placeholder="Type your password here.."
            required
            aria-describedby="password-reg-error"
          />
          <p id="password-reg-error" class="cs-err-message"></p>
        </div>
        <app-button
          id="submit-btn"
          type="submit"
          label="Register Now"
          custom-class="mt-10 w-full"
        >
        </app-button>
      </form>
      <p class="text-grey-90 mt-3 text-center text-xs">
        Already have an account?
        <strong>
          <a
            class="text-medium text-primary-60 login-btn cursor-pointer"
            href="#/login"
            >Login</a
          >
        </strong>
      </p>
    </section>
  `;
}
export function noData(data = {}) {
  const { title: _title, desc: _desc } = data;
  const title = _title ?? 'Oops! Story not Found';
  const desc = _desc ?? 'There is no stories yet';

  return `<section class="col-span-full w-full text-center">
    <img
      src="/images/no-data.png"
      class="m-auto mb-6 w-57 md:w-100"
      alt="No Data Illustration"
    />
    <p class="text-primary-60 text-xl font-semibold md:text-2xl">${title}</p>
    <p class="text-grey-80">${desc}</p>
  </section>`;
}

export function storyItem(item) {
  const {
    placeName,
    name,
    description,
    createdAt,
    photoUrl: _photoUrl,
    photo,
    id,
  } = item;

  const isPending = !!photo;
  //pending stories will have photo data instead of photoUrl, this covers status 'pending' and 'syncing';

  const cardStyles = {
    pending: 'opacity-90 cursor-default',
    live: 'cursor-pointer hover:scale-[1.01] hover:shadow-lg',
  };

  const currentStatus = isPending ? 'pending' : 'live';
  const photoUrl = _photoUrl ?? (photo ? URL.createObjectURL(photo) : '');

  return `
    <article
      class="${cardStyles[currentStatus]} relative flex flex-col gap-3 rounded-[28px] bg-white bg-cover bg-center p-4 transition-all duration-300"
      style="background-image: url('${photoUrl}'); view-transition-name: story-${id}"
    >
      <div
        class="${isPending ? 'grayscale-80!' : ''} absolute inset-0 z-10 rounded-[28px] bg-linear-to-t from-black/30 to-transparent backdrop-blur-xl"
        style="-webkit-mask-image: linear-gradient(to top, black 30%, transparent 100%); mask-image: linear-gradient(to top, black 30%, transparent 100%);"
      ></div>
      <div class="z-20 flex min-h-62.5 flex-col items-start gap-2 rounded-3xl">
        <div class="${isPending ? 'block grayscale-20' : 'hidden'} flex w-full items-center gap-2 rounded-[20px] border-amber-600 bg-light-yellow/70 px-3 py-2.5 text-amber-500 backdrop-blur-lg">
          <i class="fas fa-clock"></i>
          <p class="text-xs font-medium">Pending! Waiting for Network</p>
        </div>
        <p class="bg-grey-60/30 max-w-50 truncate rounded-full px-4 py-2 text-xs text-white backdrop-blur-xl">
          <i class="fas fa-md fa-map-marker-alt mr-1 text-white"></i>
          ${placeName ?? 'Unknown Location'}
        </p>
      </div>
      <div class="z-20 flex flex-1 flex-col justify-between">
        <div class="pb-5">
          <h3 class="truncate text-xl font-medium text-white">${name}</h2>
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
          custom-class="text-xs! w-fit px-4! py-2! text-white! border-white!  ${isPending ? 'pointer-events-none opacity-50' : 'hover:bg-white/30!'}"
          class="read-more-btn"
          label="Read More"
          right-icon="<i class='fas fa-sm fa-chevron-down -rotate-90 ml-2'></i>"
          variant="secondary"
        ></app-button>
      </div>
    </article>`;
}

export function popupContent(name, description) {
  return `
    <p class="font-medium">${name}</p>
    <p class="line-clamp-5">${description}</p>
  `;
}

export function subscribeButton(task) {
  const ariaLabel = {
    subscribe: 'Subscribe Notification',
    unsubscribe: 'Unsubscribe Notification',
  };

  const icon = {
    subscribe: 'fa-bell mr-2',
    unsubscribe: 'fa-bell-slash',
  };

  return `<button
    id="subscribe-button"
    data-task="${task}"
    aria-label="${ariaLabel[task]}"
    aria-expanded="false"
    class="flex w-full cursor-pointer items-center justify-between gap-2"
  >
    <span class="inline">
      <i class="${icon[task]} fas transition"></i>
      <span>${capitalize(task)}</span>
    </span>
    <div
      id="is-loading"
      class="loader hidden h-6! transition after:h-6! after:w-6! after:border-4"
    ></div>
  </button>`;
}

export function bookmarkStoryButton(task) {
  const desc = {
    save: `Found this story interesting?`,
    remove: `You've saved this story`,
  };

  const label = {
    save: 'Save for later',
    remove: 'Remove from saved stories',
  };

  const iconStyle = {
    save: 'far',
    remove: 'fas',
  };

  return `
    <hr class="text-grey-40 my-6" />
    <div class="flex items-center justify-between gap-3 md:justify-end">
      <p class="text-grey-80 text-sm md:text-base">${desc[task]}</p>
      <app-button
        class="min-w-36"
        data-task="${task}"
        id="save-story-btn"
        custom-class="py-1!"
        label="${label[task]}"
        variant="secondary"
        right-icon="<i class='${iconStyle[task]} fa-sm fa-bookmark ml-2'></i>"
        size="sm"
      ></app-button>
    </div>`;
}

export function metaDataDetailStory(data) {
  return `
    <div>
      <div class="mb-2 flex items-center gap-2 md:gap-3">
        <i class="fas fa-user md:fa-lg bg-grey-70/10 rounded-full p-3 md:p-4"></i>
        <div>
          <h1 class="text-xl font-semibold md:text-2xl">
            ${capitalize(data?.name)}'s Story
          </h1>
          <p class="text-grey-70 max-w-max text-sm font-light">
            ${showFormattedDate(data?.createdAt, 'id-ID')}
          </p>
        </div>
      </div>
      <p
        class="text-grey-70 bg-grey-70/10 mt-4 max-w-max rounded-full px-4 py-1.5 text-sm"
      >
        <i class="fas fa-md fa-map-marker-alt mr-1"></i>
        ${data?.placeName ?? 'Unknown Location'}
      </p>
    </div>`;
}

export function imageDetailStory(data) {
  return `
    <div
      class="absolute inset-0 z-10 scale-105 bg-cover bg-top blur-sm"
      style="background-image: url('${data?.photoUrl}')"
    ></div>
    <img
      src="${data?.photoUrl}"
      class="relative z-20 h-full w-full rounded-lg object-contain"
      alt="${data?.name}'s story at ${data?.placeName}"
    />`;
}

export function descriptionDetailStory(description) {
  return `<p class="text-grey-80 wrap-break-word md:mt-2">${description}</p>`;
}

export function photoUploaded(url) {
  return `
    <li class="relative flex h-30 w-30 flex-col items-center justify-center rounded-2xl bg-white p-2 md:h-45 md:w-45">
      <img
        src="${url}"
        alt="Photo uploaded"
        class="max-h-full max-w-full rounded-lg"
      />
      <button
        type="button"
        id="remove-photo"
        class="bg-grey-90/10 absolute right-3 bottom-3 h-10 w-10 cursor-pointer rounded-lg p-2 backdrop-blur-xl"
      >
        <i class="fas fa-trash text-primary-50"></i>
      </button>
    </li>`;
}

export function navbarDropdown(name) {
  return `
    <div
      id="dropdown"
      aria-hidden="true"
      class="text-grey-90 bg-light-bluish-grey/80 border-grey-10 fixed top-23 left-[50%] z-9999 hidden w-max min-w-[90%] -translate-x-1/2 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200 lg:min-w-[70%]"
    >
      <div class="text-primary-60 mb-4 flex items-center gap-3 rounded-full select-none md:pt-2">
        <i
          class="fas fa-user md:fa-lg rounded-full bg-white/30 p-4"
          aria-hidden="true"
        ></i>
        <p class="text-lg font-medium md:text-xl">${capitalize(name)}</p>
      </div>
      <div class="mb-3 rounded-xl bg-white/30 px-4 py-3 md:hidden">
        <p class="mb-3 text-lg font-medium md:text-xl">Menu</p>
        <ul>
          <li>
            <a
              href="#/"
              class="bg-grey-50/15 hover:text-primary-50 mb-2 block w-full cursor-pointer rounded-lg px-4 py-2 transition hover:bg-white/20"
              data-nav="home"
            >
              <i class="fas fa-file mr-2"></i>
              All Stories</a
            >
          </li>
          <li>
            <a
              class="bg-grey-50/15 hover:text-primary-50 block w-full cursor-pointer rounded-lg px-4 py-2 transition hover:bg-white/20"
              data-nav="saved-stories"
              href="#/saved-stories"
            >
              <i class="fas fa-bookmark mr-2"></i>
              Saved Stories</a
            >
          </li>
        </ul>
      </div>
      <div class="mb-3 rounded-xl bg-white/30 px-4 py-3">
        <p class="mb-3 text-lg font-medium md:text-xl">Notification Settings</p>
        <div
          id="push-notification-tools"
          class="bg-grey-50/15 hover:text-primary-50 cursor-pointer rounded-lg px-4 py-2 transition hover:bg-white/20"
        ></div>
      </div>
      <button
        id="logout-btn"
        class="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-white/30 px-4 py-2 text-red-500 transition hover:bg-red-50/40"
      >
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
        <p>Log out</p>
      </button>
    </div>
  `;
}
