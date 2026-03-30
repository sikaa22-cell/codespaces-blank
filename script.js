import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://stbdqxydmzlflnvsogde.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-mQj4leakzhkMZNuiAgYZg_EARP4OUD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PACKAGING_FEE = 200; // Csomagolási díj a PDF alapján [cite: 132]

let menuData = [];
let cart = [];

// --- MÁRCIUSI ÉTLAP SZERINTI KÖRETVÁLASZTÓS ÉTELEK ---
const koretesEtelek = [
    'Roston sült csirkemell, párolt jázmin rizs és kompót',
    'Rántott sajt, párolt jázmin rizs, tartár mártás',
    'Óriás rántott sertés karaj, rizs, borsó és házi csalamádé',
    'Lazac burger, guacamole, uborka, lollo saláta',
    'Vegan cheese burger, cékla ketchup',
    '"Bacon and Cheese" Beef Burger'
];

const sideDishes = ['Hasábburgonya', 'Jázmin rizs', 'Édesburgonya', 'Kéksajtos rukkolás burgonyapüré', 'Házi steak burgonya'];
const pizzaToppings = ['Sajt', 'Sonka', 'Gomba', 'Kukorica', 'Hagyma', 'Szalámi', 'Bacon', 'Ananász', 'Jalapeno', 'Olívabogyó', 'Tonhal', 'Tojás', 'Paradicsom', 'Paprika', 'Csirkemell', 'Rukkola', 'Parmezán', 'Fokhagyma', 'Tejföl', 'BBQ', 'Erős Pista', 'Kolbász'];

document.addEventListener('DOMContentLoaded', async () => {
    const { data } = await supabase.from('etlap').select('*');
    if (data) {
        menuData = data;
        renderCategories();
        renderMenu(data[0].kategoria);
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
}

function renderMenu(category) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    menuData.filter(i => i.kategoria === category).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.style.animationDelay = `${index * 0.1}s`;
        div.innerHTML = `<h3>${item.nev}</h3><p class="gold-text">${item.ar} Ft</p>`;
        div.onclick = () => openModal(item);
        container.appendChild(div);
    });
}

function openModal(item) {
    window.currentSelectedItem = item;
    document.getElementById('modal-title').innerText = item.nev;
    document.getElementById('modal-price').innerText = `${item.ar} Ft`;
    const options = document.getElementById('modal-options');
    options.innerHTML = '';

    if (item.kategoria === 'Pizzák') {
        options.innerHTML = '<div class="topping-grid"></div>';
        pizzaToppings.forEach(t => {
            options.querySelector('.topping-grid').innerHTML += `<label class="topping-label"><input type="checkbox" value="${t}" class="pizza-topping"> ${t}</label>`;
        });
    } else if (koretesEtelek.includes(item.nev)) {
        options.innerHTML = `<h4>Válassz köretet:</h4><select id="side-dish-select">${sideDishes.map(sd => `<option value="${sd}">${sd}</option>`).join('')}</select>`;
    }
    document.getElementById('product-modal').style.display = 'flex';
}

document.getElementById('add-to-cart-btn').onclick = () => {
    let price = window.currentSelectedItem.ar + PACKAGING_FEE;
    let desc = '';
    if (window.currentSelectedItem.kategoria === 'Pizzák') {
        const selected = Array.from(document.querySelectorAll('.pizza-topping:checked')).map(c => c.value);
        price += selected.length * 400;
        if(selected.length > 0) desc = ` (+ ${selected.join(', ')})`;
    } else if (koretesEtelek.includes(window.currentSelectedItem.nev)) {
        desc = ` (${document.getElementById('side-dish-select').value})`;
    }
    cart.push({ nev: window.currentSelectedItem.nev + desc, ar: price });
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
        container.innerHTML += `<div class="cart-item"><span>${item.nev}</span><span>${item.ar} Ft <button class="remove-btn" onclick="removeFromCart(${i})">×</button></span></div>`;
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
    const { error } = await supabase.from('rendelesek').insert([order]);
    if(!error) { alert('Sikeres rendelés!'); cart = []; updateCartUI(); document.getElementById('cart-sidebar').classList.remove('open'); e.target.reset(); }
});