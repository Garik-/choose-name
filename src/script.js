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

function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
}

function handleMove(e) {
    if (!isDragging) return;
    currentX = getClientX(e);
    const deltaX = currentX - startX;
    const rotate = deltaX * 0.1;
    cardEl.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
}

function handleStart(e) {
    startX = getClientX(e);
    isDragging = true;
    cardEl.classList.add('swiping');
}

function handleEnd() {
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
}

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

cardEl.addEventListener('touchstart', handleStart);
cardEl.addEventListener('touchmove', handleMove);
cardEl.addEventListener('touchend', handleEnd);

// For mouse (desktop testing)
cardEl.addEventListener('mousedown', handleStart);
cardEl.addEventListener('mousemove', handleMove);
cardEl.addEventListener('mouseup', handleEnd);

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