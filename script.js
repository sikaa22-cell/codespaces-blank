import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://stbdqxydmzlflnvsogde.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-mQj4leakzhkMZNuiAgYZg_EARP4OUD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PACKAGING_FEE = 200;
const TOPPING_PRICE = 400;

let menuData = []; // Üresen indul, az adatbázisból töltjük fel
let cart = [];
let currentSelectedItem = null;

// Inicializálás: Étlap letöltése a Supabase-ből
document.addEventListener('DOMContentLoaded', async () => {
    const { data, error } = await supabase.from('etlap').select('*');
    if (error) {
        console.error('Hiba az étlap letöltésekor:', error);
    } else {
        menuData = data;
        renderCategories();
        renderMenu(menuData[0].kategoria); // Az első kategória betöltése
    }
});

function renderCategories() {
    const categories = [...new Set(menuData.map(item => item.kategoria))];
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerText = cat;
        btn.onclick = (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(cat);
        };
        nav.appendChild(btn);
    });
    if(nav.firstChild) nav.firstChild.classList.add('active');
}

function renderMenu(category) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    const items = menuData.filter(i => i.kategoria === category);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `<h3>${item.nev}</h3><p class="gold-text">${item.ar} Ft</p>`;
        div.onclick = () => openModal(item);
        container.appendChild(div);
    });
}

// ... A többi funkció (openModal, addToCart, removeFromCart, checkout) változatlan marad, 
// de be kell másolnod őket a fájlba, hogy működjön minden!