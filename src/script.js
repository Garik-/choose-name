import names from './names.json' with { type: 'json' };

let currentIndex = 0;
let state;

const card = document.getElementById('card');
const nameEl = document.getElementById('name');
const progressEl = document.getElementById('progress');
const toast = document.getElementById('toast');

let startX = 0;
let currentX = 0;
let isDragging = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

shuffle(names);


function ui(text) {
    toast.textContent = text;
    toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
    }, 3000);
}

function updateCard() {
    nameEl.textContent = names[currentIndex];
    progressEl.textContent = `${currentIndex + 1} / ${names.length}`;
}

function nextCard() {
    console.log(currentIndex, names[currentIndex], state);

    if (state == 'dislike') {
        names.splice(currentIndex, 1);
    }
 
    currentIndex++;
    if (currentIndex >= names.length) {
        currentIndex = 0; // loop or handle end
    }
    updateCard();
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.classList.remove('like', 'dislike');
}

card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    card.classList.add('swiping');
});

card.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const rotate = deltaX * 0.1;
    card.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
});

card.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('swiping');
    const deltaX = currentX - startX;
    if (deltaX > 100) {
        // swipe right - like
        card.classList.add('like');
        state = 'like';
        setTimeout(nextCard, 300);
    } else if (deltaX < -100) {
        // swipe left - dislike
        card.classList.add('dislike');
        state = 'dislike';
        setTimeout(nextCard, 300);
    } else {
        // back to center
        card.style.transform = 'translateX(0) rotate(0deg)';
    }
});

// For mouse (desktop testing)
card.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
    card.classList.add('swiping');
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const deltaX = currentX - startX;
    const rotate = deltaX * 0.1;
    card.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
});

document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('swiping');
    const deltaX = currentX - startX;
    if (deltaX > 100) {
        card.classList.add('like');
        state = 'like';
        setTimeout(nextCard, 300);
    } else if (deltaX < -100) {
        card.classList.add('dislike');
        state = 'dislike';
        setTimeout(nextCard, 300);
    } else {
        card.style.transform = 'translateX(0) rotate(0deg)';
    }
});

const exportBtn = document.getElementById('export');
exportBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(names));
        ui('Имена скопированы в буфер обмена');
    } catch (err) {
        console.error('Failed to copy: ', err);
        ui('Failed to copy to clipboard');
    }
});



updateCard();