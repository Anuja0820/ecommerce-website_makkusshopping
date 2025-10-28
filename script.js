// Script for navigation bar
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');


if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  });
}
  if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}


// Redirect to single product page
document.querySelectorAll(".pro").forEach(product => {
  product.addEventListener("click", (e) => {
    if (e.target.closest(".cart")) return; // ignore cart clicks
    const id = product.dataset.id;
    if (id) window.location.href = `sproduct.html?id=${id}`;
  });
});

