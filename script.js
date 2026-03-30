import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://stbdqxydmzlflnvsogde.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-mQj4leakzhkMZNuiAgYZg_EARP4OUD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PACKAGING_FEE = 200;
let menuData = [];
let cart = [];
let currentSelectedItem = null;

const categoryOrder = ['Levesek', 'Főételek', 'Burgerek', 'Pizzák', 'Desszertek', 'Italok'];

// Főételek alap köretei
const koretesEtelek = [
    'Roston sült csirkemell, párolt jázmin rizs és kompót',
    'Rántott sajt, párolt jázmin rizs, tartár mártás',
    'Óriás rántott sertés karaj, rizs, borsó és házi csalamádé'
];

const mainSides = ['Hasábburgonya', 'Jázmin rizs', 'Édesburgonya', 'Kéksajtos rukkolás burgonyapüré', 'Házi steak burgonya'];
// Burgerek köretei: Édesburgonyával kiegészítve
const burgerSides = ['Hasábburgonya', 'Házi steak burgonya', 'Édesburgonya'];

document.addEventListener('DOMContentLoaded', async () => {
    const { data } = await supabase.from('etlap').select('*');
    if (data) {
        menuData = data;
        renderCategories();
        const firstCat = categoryOrder.find(cat => menuData.some(item => item.kategoria === cat)) || data[0].kategoria;
        renderMenu(firstCat);
    }
});

function renderCategories() {
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';
    categoryOrder.forEach(cat => {
        if (menuData.some(item => item.kategoria === cat)) {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.innerText = cat;
            btn.onclick = (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderMenu(cat);
            };
            nav.appendChild(btn);
        }
    });
}

function renderMenu(category) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    menuData.filter(i => i.kategoria === category).forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `<h3>${item.nev}</h3><p class="gold-text">${item.ar} Ft</p>`;
        div.onclick = () => openModal(item);
        container.appendChild(div);
    });
}

function openModal(item) {
    currentSelectedItem = item;
    document.getElementById('modal-title').innerText = item.nev;
    document.getElementById('modal-price').innerText = `${item.ar} Ft`;
    const options = document.getElementById('modal-options');
    options.innerHTML = '';

    // 1. Pizzák EXTRÁK (Csak pizzánál)
    if (item.kategoria === 'Pizzák') {
        const feltetek = menuData.filter(m => m.kategoria === 'Feltét');
        if (feltetek.length > 0) {
            options.innerHTML += '<h4>Extrák:</h4><div class="topping-grid"></div>';
            const grid = options.querySelector('.topping-grid');
            feltetek.forEach(f => {
                grid.innerHTML += `
                    <label class="topping-label">
                        <input type="checkbox" value="${f.nev}" data-price="${f.ar}" class="extra-checkbox">
                        <span>${f.nev} (+${f.ar} Ft)</span>
                    </label>`;
            });
        }
    }

    // 2. KÖRETVÁLASZTÓ (Főételek és Burgerek külön listával)
    let selectedSides = [];
    if (item.kategoria === 'Burgerek') {
        selectedSides = burgerSides; 
    } else if (koretesEtelek.includes(item.nev)) {
        selectedSides = mainSides; 
    }

    if (selectedSides.length > 0) {
        options.innerHTML += `
            <h4>Válassz köretet:</h4>
            <select id="side-dish-select" style="width:100%; padding:0.8rem; margin:15px 0; background:#2a2a2a; color:white; border:1px solid #c5a059; border-radius:5px;">
                <option value="Eredeti körettel">Eredeti körettel kérem</option>
                ${selectedSides.map(sd => `<option value="${sd}">${sd}</option>`).join('')}
            </select>`;
    }

    document.getElementById('product-modal').style.display = 'flex';
}

document.getElementById('add-to-cart-btn').onclick = () => {
    let totalPrice = parseInt(currentSelectedItem.ar) + PACKAGING_FEE;
    let desc = '';

    const selected = document.querySelectorAll('.extra-checkbox:checked');
    selected.forEach(cb => {
        totalPrice += parseInt(cb.dataset.price);
        desc += `, ${cb.value}`;
    });

    const sideSelect = document.getElementById('side-dish-select');
    if (sideSelect && sideSelect.value !== 'Eredeti körettel') {
        desc += ` (Köret: ${sideSelect.value})`;
    }

    cart.push({ nev: currentSelectedItem.nev + desc, ar: totalPrice });
    updateCartUI();
    document.getElementById('product-modal').style.display = 'none';
};

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, i) => {
        total += item.ar;
        container.innerHTML += `<div class="cart-item"><span>${item.nev}</span><span>${item.ar} Ft <button onclick="removeFromCart(${i})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px; font-weight:bold;">×</button></span></div>`;
    });
    document.getElementById('total-price').innerText = `${total} Ft`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); updateCartUI(); };
document.getElementById('cart-icon').onclick = () => document.getElementById('cart-sidebar').classList.add('open');
document.querySelector('.close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('open');
document.querySelector('.close-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const order = {
        nev: document.getElementById('order-name').value,
        cim: `${document.getElementById('order-address').value}, ${document.getElementById('order-floor').value}, ${document.getElementById('order-bell').value}`,
        telefon: document.getElementById('order-phone').value,
        fizetesi_mod: document.getElementById('order-payment').value,
        tetelek: cart,
        vegosszeg: cart.reduce((s, i) => s + i.ar, 0)
    };
    await supabase.from('rendelesek').insert([order]);
    alert('Sikeres rendelés!'); cart = []; updateCartUI(); document.getElementById('cart-sidebar').classList.remove('open'); e.target.reset();
});