import originalNames from './names_wiki.json' with { type: 'json' };

const State = Object.freeze({
    LIKE: 'like',
    DISLIKE: 'dislike'
});

let names = JSON.parse(localStorage.getItem('names')) || shuffle([...originalNames]);
let currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
let state;

const cardEl = document.getElementById('card');
const nameEl = document.getElementById('name');
const progressEl = document.getElementById('progress');
const toastEl = document.getElementById('toast');


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

function saveState() {
    localStorage.setItem('names', JSON.stringify(names));
    localStorage.setItem('currentIndex', currentIndex.toString());
}


function toast(text, timeout = 3000) {
    toastEl.textContent = text;
    toastEl.classList.add('active');
        setTimeout(() => {
            toastEl.classList.remove('active');
    }, timeout);
}

function updateCard() {
    if (names.length === 0) {
        nameEl.textContent = 'No more names';
        progressEl.textContent = '0 / 0';
        return;
    }
    nameEl.textContent = names[currentIndex];
    progressEl.textContent = `${currentIndex + 1} / ${names.length}`;
}

function nextCard() {
    console.log(currentIndex, names[currentIndex], state);

    if (state === State.DISLIKE) {
        names.splice(currentIndex, 1);
        // do not increment currentIndex, as the next element is now at currentIndex
    } else {
        currentIndex++;
    }

    if (currentIndex >= names.length) {
        currentIndex = 0; // loop back
        if (names.length > 0) {
            shuffle(names);
        }
    }
    saveState();
    updateCard();
    cardEl.style.transform = 'translateX(0) rotate(0deg)';
    cardEl.classList.remove('like', 'dislike');
}

cardEl.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    cardEl.classList.add('swiping');
});

cardEl.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const rotate = deltaX * 0.1;
    cardEl.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
});

cardEl.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    cardEl.classList.remove('swiping');
    const deltaX = currentX - startX;
    if (deltaX > 100) {
        // swipe right - like
        cardEl.classList.add('like');
        state = State.LIKE;
        setTimeout(nextCard, 300);
    } else if (deltaX < -100) {
        // swipe left - dislike
        cardEl.classList.add('dislike');
        state = State.DISLIKE;
        setTimeout(nextCard, 300);
    } else {
        // back to center
        cardEl.style.transform = 'translateX(0) rotate(0deg)';
    }
});

// For mouse (desktop testing)
cardEl.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
    cardEl.classList.add('swiping');
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const deltaX = currentX - startX;
    const rotate = deltaX * 0.1;
    cardEl.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
});

document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    cardEl.classList.remove('swiping');
    const deltaX = currentX - startX;
    if (deltaX > 100) {
        cardEl.classList.add('like');
        state = State.LIKE;
        setTimeout(nextCard, 300);
    } else if (deltaX < -100) {
        cardEl.classList.add('dislike');
        state = State.DISLIKE;
        setTimeout(nextCard, 300);
    } else {
        cardEl.style.transform = 'translateX(0) rotate(0deg)';
    }
});

const exportBtn = document.getElementById('export');
exportBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(names));
        toast('Имена скопированы в буфер обмена');
    } catch (err) {
        console.error('Failed to copy: ', err);
        toast('Failed to copy to clipboard');
    }
});

const restartBtn = document.getElementById('restart');
restartBtn.addEventListener('click', () => {
    localStorage.removeItem('names');
    localStorage.removeItem('currentIndex');
    location.reload();
});

updateCard();