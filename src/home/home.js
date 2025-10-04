let challenges = [];
let activeFilter = 'all';
const searchBar = document.getElementById('searchBar');
const filterBtns = document.querySelectorAll('.filter-btn');
const challengesGrid = document.getElementById('challengesGrid');
const challengeList = document.getElementById('challengeList');
const challengeDetail = document.getElementById('challengeDetail');

function loadChallenges() {
    fetch('challenge_list.json')
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
    challengesGrid.innerHTML = '';
    
    challenges.forEach(challenge => {
        const card = createChallengeCard(challenge);
        challengesGrid.appendChild(card);
    });

    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No challenges found';
    challengesGrid.appendChild(noResults);
}

function createChallengeCard(challenge) {
    const card = document.createElement('a');
    card.className = `challenge-card ${challenge.difficulty}`;
    card.dataset.difficulty = challenge.difficulty;
    card.dataset.id = challenge.id;
    card.href = `?id=${challenge.id}`;
    
    card.innerHTML = `
        <div class="challenge-header">
            <div class="challenge-name">${challenge.name}</div>
            <span class="difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
        </div>
        <p class="challenge-description">${challenge.shortDescription}</p>
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
            <span class="detail-difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
        </div>
        
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
    
    if (challenge.exampleCode) {
        detailHTML += `
            <div class="section">
                <h2 class="section-title">Example Code</h2>
                <div class="code-block">${challenge.exampleCode}</div>
            </div>
        `;
    }
    
    if (challenge.hint) {
        detailHTML += `
            <div class="section">
                <div class="hint-box">
                    <div class="hint-title">💡 Hint</div>
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