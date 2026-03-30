import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// === SUPABASE BEÁLLÍTÁSOK ===
const SUPABASE_URL = 'https://stbdqxydmzlflnvsogde.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-mQj4leakzhkMZNuiAgYZg_EARP4OUD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Állandók
const PACKAGING_FEE = 200;
const TOPPING_PRICE = 400;

// Étlap adatbázis
const menuData = [
    // --- LEVESEK (Frissítve a képek alapján) ---
    { kategoria: 'Levesek', nev: 'Falusi húsleves, ahogy a mamám készíti', ar: 2490 },
    { kategoria: 'Levesek', nev: 'Szárnyas raguleves, erdei gombák, burgonya gombóccal', ar: 2490 },
    { kategoria: 'Levesek', nev: 'Sütőtök krémleves', ar: 2390 },
    { kategoria: 'Levesek', nev: 'Pontyhalászlé', ar: 5190 },
    
    // --- FŐÉTELEK (Frissítve a képek alapján) ---
    { kategoria: 'Főételek', nev: 'Csirkefalatok mosolygós burgonyával és ketchuppal', ar: 2290 },
    { kategoria: 'Főételek', nev: 'Roston sült csirkemell, párolt jázmin rizs és kompót', ar: 2290 },
    { kategoria: 'Főételek', nev: 'Rántott sajt, párolt jázmin rizs, tartár mártás', ar: 2290 },
    { kategoria: 'Főételek', nev: 'Csirkemell supreme, kéksajtos rukkolás burgonyapüré, karamellizált barack', ar: 4990 },
    { kategoria: 'Főételek', nev: 'Bélszín Surf\'n\' Turf, smash burgonya, zöldbors mártás', ar: 10990 },
    { kategoria: 'Főételek', nev: 'Tarja pecsenye fokhagymásan, szalonna kíséret, paprikalekvár, házi fűszeres burgonya', ar: 4790 },
    { kategoria: 'Főételek', nev: 'Óriás rántott sertés karaj, rizs, borsó és házi csalamádé', ar: 4990 },
    { kategoria: 'Főételek', nev: 'Pacalpörkölt, kovászos kenyér', ar: 4490 },
    { kategoria: 'Főételek', nev: 'Kacsamell, dió, salátalevelek, körte, mustáros dresszing és pecorino sajt, focaccia', ar: 4990 },
    { kategoria: 'Főételek', nev: 'Vajhal steak, baconos ceruzabab, pirított mandula és hollandi mártás, sáfrányos jázmin rizs', ar: 5890 },
    
    // (Régi főételek, amiket meghagytam a biztonság kedvéért)
    { kategoria: 'Főételek', nev: 'Bacon & Cheese Burger', ar: 4190 },
    { kategoria: 'Főételek', nev: 'Sous Vide kacsamell', ar: 7490 },
    { kategoria: 'Főételek', nev: 'Szarvas bélszín', ar: 10990 },
    { kategoria: 'Főételek', nev: 'Konfitált kacsacomb', ar: 7150 },
    
    // --- PIZZÁK ---
    { kategoria: 'Pizzák', nev: 'Margherita', ar: 2690 },
    { kategoria: 'Pizzák', nev: 'Diavola 🌶️', ar: 2990 },
    { kategoria: 'Pizzák', nev: 'Parma', ar: 2990 },
    { kategoria: 'Pizzák', nev: 'Quattro Formaggi', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Cotto', ar: 2990 },
    { kategoria: 'Pizzák', nev: 'Ungherese 🌶️', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Frutti di mare', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Torre di carne', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Carbonara', ar: 3390 },
    { kategoria: 'Pizzák', nev: 'Bresaola', ar: 3390 },
    { kategoria: 'Pizzák', nev: 'Pesto', ar: 3390 },
    { kategoria: 'Pizzák', nev: 'Prosciutto E Funghi', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Pizza Bambino', ar: 3190 },
    { kategoria: 'Pizzák', nev: 'Pizza Songoku', ar: 3290 },
    
    // --- DESSZERTEK ---
    { kategoria: 'Desszertek', nev: 'Somlói galuska', ar: 2590 },
    { kategoria: 'Desszertek', nev: 'Házi túrógombóc', ar: 2990 },
    { kategoria: 'Desszertek', nev: 'Flódni', ar: 2190 },
    { kategoria: 'Desszertek', nev: 'Palacsinta', ar: 1500 }
];

const pizzaToppings = [
    'Sajt', 'Sonka', 'Gomba', 'Kukorica', 'Hagyma', 'Szalámi', 'Bacon', 'Ananász', 'Jalapeno', 'Olívabogyó',
    'Tonhal', 'Tojás', 'Paradicsom', 'Paprika', 'Csirkemell', 'Rukkola', 'Parmezán', 'Fokhagyma', 'Tejföl', 'BBQ', 'Erős Pista', 'Kolbász'
];

let cart = [];
let currentSelectedItem = null;

// Inicializálás
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderMenu('Levesek');
});

function renderCategories() {
    const categories = [...new Set(menuData.map(item => item.kategoria))];
    const nav = document.getElementById('category-nav');
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn' + (cat === 'Levesek' ? ' active' : '');
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
    
    const items = menuData.filter(i => i.kategoria === category);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <h3>${item.nev}</h3>
            <p class="gold-text">${item.ar} Ft</p>
        `;
        div.onclick = () => openModal(item);
        container.appendChild(div);
    });
}

// Modal kezelés
function openModal(item) {
    currentSelectedItem = item;
    document.getElementById('modal-title').innerText = item.nev;
    document.getElementById('modal-price').innerText = `${item.ar} Ft (Alapár)`;
    
    const optionsDiv = document.getElementById('modal-options');
    optionsDiv.innerHTML = '';

    if (item.kategoria === 'Pizzák') {
        optionsDiv.innerHTML = '<h4>Extra feltétek (+400 Ft/db):</h4><div class="topping-grid"></div>';
        const grid = optionsDiv.querySelector('.topping-grid');
        pizzaToppings.forEach(topping => {
            grid.innerHTML += `
                <label class="topping-label">
                    <input type="checkbox" value="${topping}" class="pizza-topping"> ${topping}
                </label>
            `;
        });
    } else if (item.nev === 'Palacsinta') {
        optionsDiv.innerHTML = `
            <h4>Válassz tölteléket:</h4>
            <select id="palacsinta-toltelek" style="width:100%; padding:0.5rem; margin-top:0.5rem;">
                <option value="Nutella">Nutella</option>
                <option value="Kakaó">Kakaó</option>
                <option value="Mák">Mák</option>
                <option value="Túró">Túró</option>
            </select>
        `;
    }

    document.getElementById('product-modal').style.display = 'flex';
}

document.querySelector('.close-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';

// Kosárba rakás
document.getElementById('add-to-cart-btn').onclick = () => {
    let finalPrice = currentSelectedItem.ar;
    let description = '';

    if (currentSelectedItem.kategoria === 'Pizzák') {
        const selected = Array.from(document.querySelectorAll('.pizza-topping:checked')).map(cb => cb.value);
        if (selected.length > 0) {
            finalPrice += selected.length * TOPPING_PRICE;
            description = ` (+ ${selected.join(', ')})`;
        }
    } else if (currentSelectedItem.nev === 'Palacsinta') {
        description = ` (${document.getElementById('palacsinta-toltelek').value})`;
    }

    finalPrice += PACKAGING_FEE; // Csomagolás hozzáadása

    cart.push({
        nev: currentSelectedItem.nev + description,
        ar: finalPrice
    });

    updateCartUI();
    document.getElementById('product-modal').style.display = 'none';
    
    // Bounce animáció a kosáron
    const cartIcon = document.getElementById('cart-icon');
    cartIcon.classList.remove('cart-bounce');
    void cartIcon.offsetWidth; 
    cartIcon.classList.add('cart-bounce');
};

// Elem törlése a kosárból
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// Kosár UI
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');

document.getElementById('cart-icon').onclick = () => {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
};

function closeCart() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
}
document.querySelector('.close-cart').onclick = closeCart;
overlay.onclick = closeCart;

// Kosár kinézetének frissítése
function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const itemsContainer = document.getElementById('cart-items');
    itemsContainer.innerHTML = '';
    
    let total = 0;
    cart.forEach((item, index) => {
        total += item.ar;
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span>${item.nev} <br><small class="text-muted">(tartalmazza: 200Ft csomagolás)</small></span>
                </div>
                <div class="cart-item-actions">
                    <span class="gold-text">${item.ar} Ft</span>
                    <button class="remove-btn" onclick="removeFromCart(${index})" title="Törlés">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    document.getElementById('total-price').innerText = `${total} Ft`;
}

// Rendelés leadása a Supabase-be
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('A kosarad üres!');

    // Jogi checkbox ellenőrzése
    const termsAccepted = document.getElementById('accept-terms').checked;
    if (!termsAccepted) return alert('Kérjük, fogadd el az ÁSZF-et és az Adatvédelmi tájékoztatót!');

    const nev = document.getElementById('order-name').value;
    const cim = document.getElementById('order-address').value;
    const telefon = document.getElementById('order-phone').value;
    const fizetesi_mod = document.getElementById('order-payment').value; 
    const vegosszeg = cart.reduce((sum, item) => sum + item.ar, 0);

    const { data, error } = await supabase
        .from('rendelesek')
        .insert([{ nev, cim, telefon, fizetesi_mod, tetelek: cart, vegosszeg }]);

    if (error) {
        console.error(error);
        alert('Hiba történt a rendelés során.');
    } else {
        alert('Köszönjük a rendelést!');
        cart = [];
        updateCartUI();
        closeCart();
        e.target.reset();
    }
});