document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            switchView(targetId);
        });
    });

    window.switchView = (targetId) => {
        // Update nav
        navItems.forEach(nav => {
            if(nav.getAttribute('data-target') === targetId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Update sections
        sections.forEach(sec => {
            if(sec.id === targetId) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });

        if(targetId === 'dashboard') {
            loadDashboard();
        }
    };

    // Load Dashboard Data
    const LAWYER_ID = '793776d8-0f5c-4232-a158-c94054b29666'; // Hardcoded for demo

    async function loadDashboard() {
        const container = document.getElementById('cases-container');
        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await fetch(`/api/cases?lawyer_id=${LAWYER_ID}`);
            const data = await response.json();

            if(data.success && data.data) {
                renderCases(data.data);
                document.getElementById('stat-active').textContent = data.data.length;
            } else {
                container.innerHTML = `<p>Error loading cases: ${data.error}</p>`;
            }
        } catch (error) {
            container.innerHTML = `<p>Connection error.</p>`;
        }
    }

    function renderCases(cases) {
        const container = document.getElementById('cases-container');
        container.innerHTML = '';

        if(cases.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary)">No cases found. Create your first case!</p>';
            return;
        }

        cases.forEach(c => {
            const card = document.createElement('div');
            card.className = 'case-card glass-panel';
            card.innerHTML = `
                <div class="case-header">
                    <span class="case-id">${c.id}</span>
                    <span class="status-badge ${c.status}">${c.status}</span>
                </div>
                <div class="case-body">
                    <h3>${c.client_name}</h3>
                    <p>${c.case_type.replace('_', ' ').toUpperCase()} ${c.sub_type ? '- '+c.sub_type : ''}</p>
                    <p style="margin-top:8px; font-size:0.8rem">Added: ${new Date(c.created_at).toLocaleDateString()}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Handle Form Submission
    const form = document.getElementById('new-case-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner');

        // Loading state
        btnText.textContent = 'Processing with AI...';
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch('/api/cases/create', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if(data.success) {
                displayAIResults(data.data);
                form.reset();
            } else {
                alert('Error creating case: ' + data.error);
            }
        } catch (error) {
            alert('Failed to connect to backend.');
        } finally {
            // Restore state
            btnText.textContent = 'Process Case with AI';
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function displayAIResults(data) {
        const resultsDiv = document.getElementById('ai-results');
        const factsPre = document.getElementById('extracted-facts');
        const timelineList = document.getElementById('generated-timeline');

        // Format facts nicely
        factsPre.textContent = JSON.stringify(data.extracted_facts, null, 2);

        // Render timeline
        timelineList.innerHTML = '';
        if(data.timeline && data.timeline.length > 0) {
            data.timeline.forEach(t => {
                timelineList.innerHTML += `
                    <li class="timeline-item">
                        <div class="date">${new Date(t.hearing_date).toLocaleDateString()}</div>
                        <div class="title">${t.hearing_type}</div>
                        <div style="font-size: 0.8rem; color: #a0a5b1;">${t.court} - ${t.location}</div>
                    </li>
                `;
            });
        } else {
            timelineList.innerHTML = '<p>No timeline generated.</p>';
        }

        resultsDiv.classList.remove('hidden');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Initial load
    loadDashboard();
});
