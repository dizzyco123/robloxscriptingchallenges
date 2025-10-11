let challenges = [];
let activeFilter = 'all';
const searchBar = document.getElementById('searchBar');
const filterBtns = document.querySelectorAll('.filter-btn');
const challengesGrid = document.getElementById('challengesGrid');
const challengeList = document.getElementById('challengeList');
const challengeDetail = document.getElementById('challengeDetail');

function loadChallenges() {
    fetch("https://raw.githubusercontent.com/dizzyco123/robloxscriptingchallenges/refs/heads/main/src/home/challenge_list.json")
        .then(response => response.json())
        .then(data => {
            challenges = data.challenges;
            renderChallenges();
    })
    .catch(error => console.error('Error loading challenges:', error));
    
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get('id');
    if (challengeId) {
        showChallengeDetail(parseInt(challengeId));
    }
}

function renderChallenges() {
    const now = new Date();
    const completed = JSON.parse(localStorage.getItem('completedChallenges')) || [];

    const stats = {beginner: 0, novice: 0, advanced: 0, expert: 0};

    const newChallenges = [];
    const oldChallenges = [];
    const completedChallenges = [];

    challenges.forEach(challenge => {
        const daysOld = (now - new Date(challenge.timeCreated)) / (1000 * 60 * 60 * 24);
        const isNew = daysOld < 7;
        const isCompleted = completed.includes(challenge.id);

        if (isCompleted) {
            completedChallenges.push(challenge);
            stats[challenge.difficulty]++;
        } else if (isNew) {
            newChallenges.push(challenge);
        } else {
            oldChallenges.push(challenge);
        }
    });

    oldChallenges.sort(() => Math.random() - 0.5);

    const orderedChallenges = [...newChallenges, ...oldChallenges, ...completedChallenges];

    challengesGrid.innerHTML = '';
    orderedChallenges.forEach(challenge => {
        const card = createChallengeCard(challenge, completed);
        challengesGrid.appendChild(card);
    });

    // no results
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No challenges found';
    challengesGrid.appendChild(noResults);

    // stats
    document.getElementById('beginnerCount').textContent = stats.beginner;
    document.getElementById('noviceCount').textContent = stats.novice;
    document.getElementById('advancedCount').textContent = stats.advanced;
    document.getElementById('expertCount').textContent = stats.expert;
}


function createChallengeCard(challenge, completedList = []) {
    const now = new Date();
    const isNew = (now - new Date(challenge.timeCreated)) / (1000 * 60 * 60 * 24) < 7;
    const isCompleted = completedList.includes(challenge.id);

    const card = document.createElement('a');
    card.className = `challenge-card ${challenge.difficulty}`;
    card.dataset.difficulty = challenge.difficulty;
    card.dataset.id = challenge.id;
    card.href = `?id=${challenge.id}`;

    if (isCompleted) {
        card.classList.add('completed');
    }

    card.innerHTML = `
        <div class="challenge-header">
            <div class="challenge-name">${challenge.name}</div>
            <span class="difficulty ${challenge.difficulty}">${challenge.difficulty} ${challenge.level}</span>
            ${isNew ? `<span class="new-badge">New!</span>` : ''}
        </div>
        <p class="challenge-description">${challenge.shortDescription}</p>
        ${isCompleted ? `<div class="completed-overlay">Completed</div>` : ''}
    `;

    card.addEventListener('click', (e) => {
        e.preventDefault();
        showChallengeDetail(challenge.id);
        window.history.pushState({}, '', `?id=${challenge.id}`);
    });

    return card;
}

function showChallengeDetail(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    challengeList.style.display = 'none';
    challengeDetail.classList.add('active');
    
    let detailHTML = `
        <a href="#" class="back-link" id="backLink">← Back to Challenges</a>
        
        <div class="detail-header ${challenge.difficulty}">
            <h1 class="detail-title">${challenge.name}</h1>
            <span class="detail-difficulty ${challenge.difficulty}">${challenge.difficulty} ${challenge.level}</span>
        </div>

        <button class="detail-complete-btn" id="markCompleteBtn">Mark as Complete<span class="particletext confetti"></span></button>
        
        <div class="detail-content">
            <div class="section">
                <h2 class="section-title">Description</h2>
                <p class="section-content">${challenge.fullDescription}</p>
            </div>
    `;
    
    if (challenge.requirements && challenge.requirements.length > 0) {
        detailHTML += `
            <div class="section">
                <h2 class="section-title">Requirements</h2>
                <ul class="requirements-list">
                    ${challenge.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (challenge.exampleOutput) {
        detailHTML += `
            <div class="section">
                <h2 class="section-title">Example Output</h2>
                <div class="code-block">${challenge.exampleOutput}</div>
            </div>
        `;
    }
    
    if (challenge.hint) {
        detailHTML += `
            <div class="section">
                <div class="hint-box">
                    <div class="hint-title">﹗ Hint</div>
                    <p class="section-content">${challenge.hint}</p>
                </div>
            </div>
        `;
    }
    
    if (challenge.resources && challenge.resources.length > 0) {
        detailHTML += `
            <div class="section">
                <h2 class="section-title">Learning Resources</h2>
                <div class="section-content">
                    ${challenge.resources.map(res => 
                        `<a href="${res.url}" class="resource-link" target="_blank">• ${res.name}</a>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    detailHTML += `</div>`;
    
    challengeDetail.innerHTML = detailHTML;
    
    document.getElementById('backLink').addEventListener('click', (e) => {
        e.preventDefault();
        showChallengeList();
        window.history.pushState({}, '', window.location.pathname);
    });
    
    window.scrollTo(0, 0);

    const completeBtn = document.getElementById('markCompleteBtn');
    if (completeBtn) {
        const completed = JSON.parse(localStorage.getItem('completedChallenges')) || [];
        if (completed.includes(challenge.id)) {
            completeBtn.textContent = '✓ Completed';
        }

        completeBtn.addEventListener('click', () => {
            if (completeBtn.textContent == 'Mark as Complete') {
                console.log("com");
                markChallengeCompletion(challenge.id);
                completeBtn.textContent = '✓ Completed';
            } else {
                markChallengeCompletion(challenge.id);
                console.log("comp");
                completeBtn.textContent = 'Mark as Complete';
            }
            renderChallenges();
        });
    }
}

function markChallengeCompletion(id) {
    let completed = JSON.parse(localStorage.getItem('completedChallenges')) || [];

    if (!completed.includes(id)) {
        completed.push(id);
    } else {
        completed = completed.filter(item => item !== id);
    }

    localStorage.setItem('completedChallenges', JSON.stringify(completed));
}

function showChallengeList() {
    challengeList.style.display = 'block';
    challengeDetail.classList.remove('active');
    window.scrollTo(0, 0);
}

window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get('id');
    if (challengeId) {
        showChallengeDetail(parseInt(challengeId));
    } else {
        showChallengeList();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        filterChallenges();
    });
});

searchBar.addEventListener('input', () => {
    filterChallenges();
});

function filterChallenges() {
    const searchText = searchBar.value.toLowerCase();
    const cards = document.querySelectorAll('.challenge-card');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.querySelector('.challenge-name').textContent.toLowerCase();
        const description = card.querySelector('.challenge-description').textContent.toLowerCase();
        const difficulty = card.dataset.difficulty;

        const matchesSearch = name.includes(searchText) || description.includes(searchText);
        const matchesFilter = activeFilter === 'all' || difficulty === activeFilter;

        if (matchesSearch && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (visibleCount === 0) {
        noResults.classList.add('show');
    } else {
        noResults.classList.remove('show');
    }
}

loadChallenges();

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const waitForChallenges = setInterval(() => {
            if (typeof challenges !== 'undefined' && challenges.length > 0) {
                clearInterval(waitForChallenges);
                showChallengeDetail(parseInt(id));
            }
        }, 100);
    }
});