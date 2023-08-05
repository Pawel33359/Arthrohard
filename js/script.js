"use strict";

///////////////////////////////////////////////////////////
// DOM ELEMENTS
const allLinks = document.querySelectorAll("a:link");
const introEl = document.getElementById("intro");
const informationEl = document.getElementById("information");
const detailsEl = document.getElementById("details");
const productsEl = document.getElementById("products");

const linkInformationEl = document.getElementById("link-information");
const linkDetailsEl = document.getElementById("link-details");
const linkProductsEl = document.getElementById("link-products");

const pageEl = document.querySelector(".products__page-size");
const spinnerContainerEl = document.querySelector(".products__spinner");
const spinnerEl = document.querySelector(".products__spinner .spinner");
const productsContainerEl = document.querySelector(".products__container");
const popupEl = document.querySelector(".products__popup");
const overlayEl = document.querySelector(".overlay");
const closePopupEl = document.querySelector(".products__popup-exit");

///////////////////////////////////////////////////////////
// SMOOTH SCROLLING
allLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    //Scroll back to top
    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    //Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

///////////////////////////////////////////////////////////
// STICKY NAVIGATION
const stickyObs = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];
    // if not intersecting intro section, then make navbar sticky
    if (!ent.isIntersecting)
      document.querySelector("body").classList.add("sticky");
    if (ent.isIntersecting)
      document.querySelector("body").classList.remove("sticky");
  },
  {
    root: null,
    threshold: 0,
    rootMargin: "-122px",
  }
);
stickyObs.observe(introEl);

///////////////////////////////////////////////////////////
// ACTIVE SECTIONS
window.addEventListener("scroll", (e) => {
  //Clear all active classes
  clearAllActive();

  // Set elements and scroll heights
  const { top: informationTop, bottom: informationBottom } =
    informationEl.getBoundingClientRect();
  const { top: detailsTop, bottom: detailsBottom } =
    detailsEl.getBoundingClientRect();
  const { top: productsTop } = productsEl.getBoundingClientRect();

  const scrollY = window.scrollY + 266;
  const newInformationTop = informationTop + window.scrollY;
  const newInformationBottom = informationBottom + window.scrollY;
  const newDetailsTop = detailsTop + window.scrollY;
  const newDetailsBottom = detailsBottom + window.scrollY;
  const newProductsTop = productsTop + window.scrollY;

  // set active section
  if (scrollY >= newInformationTop && scrollY <= newInformationBottom)
    setActive("information");
  if (scrollY >= newDetailsTop && scrollY <= newDetailsBottom)
    setActive("details");
  if (scrollY >= newProductsTop) setActive("products");
});

function setActive(sectionName) {
  document
    .getElementById(`link-${sectionName}`)
    .classList.add("navbar__link--active");
}

function clearAllActive() {
  linkInformationEl.classList.remove("navbar__link--active");
  linkDetailsEl.classList.remove("navbar__link--active");
  linkProductsEl.classList.remove("navbar__link--active");
}

///////////////////////////////////////////////////////////
// PRODUCTS
const products = [];
let currentPage = 1;
let pageSize = pageEl.value;
let isLoading = false;

//GET PRODUCTS FROM API
async function getProducts() {
  if (isLoading) return;
  try {
    // set to loading
    isLoading = true;
    spinnerEl.classList.remove("display-none");

    // fetch data
    const res = await fetch(
      `https://brandstestowy.smallhost.pl/api/random?pageNumber=${currentPage}&pageSize=${pageSize}`
    );
    const data = await res.json();

    // add data
    data.data.forEach((item) => products.push(item));
    addProducts(data.data);
    currentPage += 1;
  } catch (err) {
    console.log(err.message);
  } finally {
    spinnerEl.classList.add("display-none");
    isLoading = false;
  }
}

// INFINITE SCROLLING
const spinnerObs = new IntersectionObserver(
  function (entries) {
    // If it's intersecting spinner, fetch data
    const ent = entries[0];
    if (ent.isIntersecting) getProducts();
  },
  {
    root: null,
    threshold: 0,
  }
);
spinnerObs.observe(spinnerContainerEl);

// CHANGE PAGE SIZE
pageEl.addEventListener("change", (e) => {
  pageSize = e.target.value;
  deleteProducts();
});

// ADD AND DELETE PRODUCTS
function addProducts(data) {
  // create html markup
  let markup = "";
  data.forEach((item) => {
    markup += ` <div class="products__product" data-id="${item.id}">ID: ${item.id}</div> `;
  });

  // Insert markup into products container
  productsContainerEl.insertAdjacentHTML("beforeend", markup);
}
function deleteProducts() {
  // Clear products array annd current page
  products.length = 0;
  currentPage = 1;
  // Clear products container
  productsContainerEl.innerHTML = "";
}

// SHOW POPUP ON CLICK
productsContainerEl.addEventListener("click", (e) => {
  if (!e.target.className.includes("products__product")) return;
  const product = products.find((item) => item.id === +e.target.dataset.id);
  preparePopup(product);
});

function preparePopup(product) {
  document.querySelector(".popup__id").innerHTML = `ID: ${product.id}`;
  document.querySelector(".popup__name").innerHTML = `Nazwa: ${product.name}`;
  document.querySelector(
    ".popup__price"
  ).innerHTML = `Wartość: ${product.value}`;

  showPopup();
}

// HIDE POPUP ON CLICK
overlayEl.addEventListener("click", (e) => hidePopup());
closePopupEl.addEventListener("click", (e) => hidePopup());

// DISABLE SCROLL ON POPUP
function disableScroll() {
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;
  window.onscroll = function () {
    window.scrollTo(scrollLeft, scrollTop);
  };
}
// ENABLE SCROLL ON EXIT POPUP
function enableScroll() {
  window.onscroll = function () {};
}

// SHOW AND HIDE POPUP FUNCTIONS
function showPopup() {
  disableScroll();
  showElement(popupEl);
  showElement(overlayEl);
}
function hidePopup() {
  enableScroll();
  hideElement(popupEl);
  hideElement(overlayEl);
}

// SHOW AND HIDE ELEMENTS FUNCTIONS
function showElement(el) {
  el.classList.remove("hidden");
}
function hideElement(el) {
  el.classList.add("hidden");
}
