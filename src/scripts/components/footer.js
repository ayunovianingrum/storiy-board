class FooterArea extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer
        id="footer-area"
        class="text-primary-60 bg-bluish-grey/60 relative mt-10 overflow-hidden rounded-t-[50px] p-14 pb-16 md:pb-27"
      >
        <div class="m-auto flex max-w-270 flex-col items-start justify-center gap-6 md:flex-row">
          <div class="max-w-100">
            <h2 class="text-lg font-medium">Location</h2>
            <p class="text-primary-60/70 mt-1 text-sm">
              Dicoding Space Jl. Batik Kumeli No. 50, Sukaluyu, Kec. Cibeunying
              Kaler, Kota Bandung Jawa Barat 40123
            </p>
          </div>
          <div class="w-100">
            <h2 class="text-lg font-medium">Company</h2>
            <ul class="text-primary-60/70 grid md:grid-cols-2">
              <li>
                <a
                  href="https://www.dicoding.com/about"
                  target="_blank"
                  class="text-sm"
                  >About Us</a
                >
              </li>
              <li>
                <a
                  href="https://www.dicoding.com/contact-us"
                  target="_blank"
                  class="text-sm"
                  >Contact Us</a
                >
              </li>
              <li>
                <a
                  href="https://www.dicoding.com/blog/"
                  target="_blank"
                  class="text-sm"
                  >FAQ</a
                >
              </li>
              <li>
                <a
                  href="https://help.dicoding.com/"
                  target="_blank"
                  class="text-sm"
                  >Blog</a
                >
              </li>
            </ul>
          </div>
        </div>
        <p class="pointer-events-none absolute bottom-0 left-0 w-full translate-y-[45%] text-center text-7xl leading-none font-semibold whitespace-nowrap opacity-20 select-none md:text-[160px]">
          Storiy Board
        </p>
      </footer>`;
  }
}

customElements.define('footer-area', FooterArea);
