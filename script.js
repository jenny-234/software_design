// Database simulation
        class Database {
            constructor() {
                this.users = {};
                this.votes = {};
                this.candidates = {
                    1: {}, 2: {}, 3: {}, 4: {}
                };
                this.initializeDefaultData();
            }

            initializeDefaultData() {
                // Create admin account
                this.users['admin@bscpe.edu'] = {
                    password: 'admin123',
                    id_number: 'ADMIN001',
                    username: 'Administrator',
                    year_level: 'admin',
                    role: 'admin'
                };

                // Create demo student account
                this.users['student@bscpe.edu'] = {
                    password: 'student123',
                    id_number: '2021-001',
                    username: 'Demo Student',
                    year_level: '3',
                    role: 'student'
                };

                // Initialize default candidates for each year
                const positions = ["President", "Vice President Internal", "Vice President External", "Secretary", "Treasurer", "Auditor"];
                for (let year = 1; year <= 4; year++) {
                    positions.forEach(position => {
                        this.candidates[year][position] = [
                            `Party A Candidate - ${position} Y${year}`,
                            `Party B Candidate - ${position} Y${year}`
                        ];
                    });
                }
            }

            createUser(email, userData) {
                console.log('Creating user:', email, userData); // Debug log
                if (this.users[email]) {
                    throw new Error('Email already registered');
                }
                this.users[email] = { ...userData, role: 'student' };
                console.log('User created successfully. Total users:', Object.keys(this.users).length); // Debug log
                console.log('All users:', Object.keys(this.users)); // Debug log
                return true;
            }

            authenticateUser(email, password) {
                console.log('Attempting login for:', email); // Debug log
                console.log('Available users:', Object.keys(this.users)); // Debug log
                const user = this.users[email];
                if (user && user.password === password) {
                    console.log('Login successful for:', email); // Debug log
                    return user;
                }
                console.log('Login failed for:', email, 'User exists:', !!user, 'Password match:', user ? user.password === password : 'N/A'); // Debug log
                return null;
            }

            addCandidate(year, position, name) {
                if (!this.candidates[year][position]) {
                    this.candidates[year][position] = [];
                }
                this.candidates[year][position].push(name);
            }

            removeCandidate(year, position, index) {
                if (this.candidates[year][position]) {
                    this.candidates[year][position].splice(index, 1);
                }
            }

            submitVote(email, voteData) {
                if (this.votes[email]) {
                    throw new Error('User has already voted');
                }
                this.votes[email] = voteData;
                return true;
            }

            hasVoted(email) {
                return !!this.votes[email];
            }

            getVote(email) {
                return this.votes[email];
            }

            getCandidates(year) {
                return this.candidates[year] || {};
            }

            // New method to get all data for database viewing
            getAllData() {
                return {
                    users: this.users,
                    votes: this.votes,
                    candidates: this.candidates
                };
            }
        }

        // Initialize database
        const db = new Database();
        let currentUser = null;
        let currentEmail = null;
        let currentAdminYear = 1;

        // Utility functions
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        function showError(elementId, message) {
            const errorEl = document.getElementById(elementId);
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        function showSuccess(elementId, message) {
            const successEl = document.getElementById(elementId);
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 3000);
        }

        // Database viewing functionality
        function showDatabaseModal() {
            populateDatabaseContent();
            const modal = new bootstrap.Modal(document.getElementById('databaseModal'));
            modal.show();
        }

        function populateDatabaseContent() {
            const container = document.getElementById('databaseContent');
            const data = db.getAllData();
            
            container.innerHTML = `
                <div class="database-section">
                    <h5 class="text-primary">👥 Users (${Object.keys(data.users).length})</h5>
                    <div class="json-viewer">
                        ${formatUsersData(data.users)}
                    </div>
                </div>

                <div class="database-section">
                    <h5 class="text-success">🗳️ Votes (${Object.keys(data.votes).length})</h5>
                    <div class="json-viewer">
                        ${Object.keys(data.votes).length === 0 ? 
                            '<em class="text-muted">No votes submitted yet</em>' : 
                            formatVotesData(data.votes)
                        }
                    </div>
                </div>

                <div class="database-section">
                    <h5 class="text-warning">🏆 Candidates</h5>
                    <div class="json-viewer">
                        ${formatCandidatesData(data.candidates)}
                    </div>
                </div>
            `;
        }

        function formatUsersData(users) {
            let html = '';
            Object.entries(users).forEach(([email, userData]) => {
                const safeUserData = { ...userData };
                safeUserData.password = '••••••••'; // Hide passwords
                html += `<div class="mb-3">
                    <strong>${email}</strong><br>
                    <div class="ms-3">
                        Role: <span class="badge ${userData.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${userData.role}</span><br>
                        Name: ${userData.username}<br>
                        ID: ${userData.id_number}<br>
                        Year: ${userData.year_level}
                    </div>
                </div>`;
            });
            return html || '<em class="text-muted">No users found</em>';
        }

        function formatVotesData(votes) {
            let html = '';
            Object.entries(votes).forEach(([email, voteData]) => {
                html += `<div class="mb-3">
                    <strong>${email}</strong><br>
                    <div class="ms-3">
                        Voter: ${voteData.voter}<br>
                        ID: ${voteData.id}<br>
                        Year: ${voteData.year}<br>
                        Section: ${voteData.section}<br>
                        Time: ${new Date(voteData.timestamp).toLocaleString()}<br>
                        <strong>Choices:</strong>
                        <div class="ms-3">
                            ${Object.entries(voteData.choices).map(([position, candidate]) => 
                                `${position}: ${candidate}`
                            ).join('<br>')}
                        </div>
                    </div>
                </div>`;
            });
            return html;
        }

        function formatCandidatesData(candidates) {
            let html = '';
            Object.entries(candidates).forEach(([year, positions]) => {
                html += `<div class="mb-3">
                    <strong>Year ${year}:</strong><br>
                    <div class="ms-3">`;
                Object.entries(positions).forEach(([position, candidateList]) => {
                    html += `<div class="mb-2">
                        <strong>${position}:</strong><br>
                        <div class="ms-3">
                            ${candidateList.length === 0 ? 
                                '<em class="text-muted">No candidates</em>' : 
                                candidateList.map(candidate => `• ${candidate}`).join('<br>')
                            }
                        </div>
                    </div>`;
                });
                html += `</div></div>`;
            });
            return html;
        }

        function refreshDatabase() {
            populateDatabaseContent();
        }

        // Signup functionality
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const id = document.getElementById('signupId').value;
            const username = document.getElementById('signupUsername').value;
            const year = document.getElementById('signupYear').value;

            try {
                db.createUser(email, {
                    password: password,
                    id_number: id,
                    username: username,
                    year_level: year
                });

                showSuccess('signupSuccess', 'Account created successfully! Please log in.');
                document.getElementById('signupForm').reset();
                setTimeout(() => {
                    showPage('loginPage');
                }, 2000);
            } catch (error) {
                showError('signupError', error.message);
            }
        });

        // Login functionality
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const user = db.authenticateUser(email, password);
            if (user) {
                currentUser = user;
                currentEmail = email;
                
                if (user.role === 'admin') {
                    showAdminPage();
                } else if (db.hasVoted(email)) {
                    showReceipt();
                } else {
                    showVotingPage();
                }
                
                document.getElementById('loginForm').reset();
            } else {
                showError('loginError', 'Invalid email or password.');
            }
        });

        // Admin functionality
        function showAdminPage() {
            setupAdminTabs();
            displayCandidates(currentAdminYear);
            showPage('adminPage');
        }

        function setupAdminTabs() {
            const tabs = document.querySelectorAll('#yearTabs button');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    currentAdminYear = parseInt(this.dataset.year);
                    displayCandidates(currentAdminYear);
                });
            });
        }

        function displayCandidates(year) {
            const container = document.getElementById('candidatesDisplay');
            const candidates = db.getCandidates(year);
            
            container.innerHTML = `<h5>Candidates for ${year}${getOrdinalSuffix(year)} Year</h5>`;
            
            Object.entries(candidates).forEach(([position, candidateList]) => {
                const positionDiv = document.createElement('div');
                positionDiv.className = 'mb-4';
                positionDiv.innerHTML = `
                    <h6 class="text-primary">${position}</h6>
                    <div class="ms-3">
                        ${candidateList.map((candidate, index) => `
                            <div class="candidate-item">
                                <span>${candidate}</span>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeCandidate('${year}', '${position}', ${index})">
                                    Remove
                                </button>
                            </div>
                        `).join('')}
                        ${candidateList.length === 0 ? '<p class="text-muted">No candidates added yet</p>' : ''}
                    </div>
                `;
                container.appendChild(positionDiv);
            });
        }

        function getOrdinalSuffix(num) {
            const suffixes = ['', 'st', 'nd', 'rd', 'th'];
            return suffixes[num] || 'th';
        }

        // Add candidate functionality
        document.getElementById('addCandidateForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const position = document.getElementById('candidatePosition').value;
            const name = document.getElementById('candidateName').value;
            
            db.addCandidate(currentAdminYear, position, name);
            displayCandidates(currentAdminYear);
            
            document.getElementById('addCandidateForm').reset();
        });

        function removeCandidate(year, position, index) {
            db.removeCandidate(parseInt(year), position, index);
            displayCandidates(currentAdminYear);
        }

        // Show voting page
        function showVotingPage() {
            const container = document.getElementById('candidatesContainer');
            const candidates = db.getCandidates(parseInt(currentUser.year_level));
            
            document.getElementById('voterYear').value = `${currentUser.year_level}${getOrdinalSuffix(parseInt(currentUser.year_level))} Year`;
            
            container.innerHTML = '';

            Object.entries(candidates).forEach(([position, candidateList]) => {
                if (candidateList.length > 0) {
                    const positionDiv = document.createElement('div');
                    positionDiv.className = 'vote-option';
                    positionDiv.innerHTML = `
                        <h5 class="text-primary mb-3">${position}</h5>
                        <div class="ms-3">
                            ${candidateList.map((candidate, index) => `
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="${position}" value="${candidate}" id="${position}_${index}" required>
                                    <label class="form-check-label" for="${position}_${index}">
                                        ${candidate}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    container.appendChild(positionDiv);
                }
            });

            showPage('votePage');
        }

        // Vote submission
        document.getElementById('voteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const section = document.getElementById('voteSection').value;
            const candidates = db.getCandidates(parseInt(currentUser.year_level));
            
            const choices = {};
            Object.keys(candidates).forEach(position => {
                const selectedOption = document.querySelector(`input[name="${position}"]:checked`);
                if (selectedOption) {
                    choices[position] = selectedOption.value;
                }
            });

            try {
                db.submitVote(currentEmail, {
                    voter: currentUser.username,
                    id: currentUser.id_number,
                    choices: choices,
                    year: `${currentUser.year_level}${getOrdinalSuffix(parseInt(currentUser.year_level))} Year`,
                    section: section,
                    timestamp: new Date().toISOString()
                });

                showReceipt();
            } catch (error) {
                alert(error.message);
            }
        });

        // Show receipt
        function showReceipt() {
            const vote = db.getVote(currentEmail);
            const receiptContent = document.getElementById('receiptContent');
            
            receiptContent.innerHTML = `
                <div class="text-center mb-4">
                    <h4 class="text-success">✓ Vote Successfully Submitted</h4>
                </div>
                <p><strong>Voter:</strong> ${vote.voter}</p>
                <p><strong>Student ID:</strong> ${vote.id}</p>
                <p><strong>Year Level:</strong> ${vote.year}</p>
                <p><strong>Section:</strong> ${vote.section}</p>
                <p><strong>Timestamp:</strong> ${new Date(vote.timestamp).toLocaleString()}</p>
                <hr>
                <h5>Your Votes:</h5>
                <ul class="list-group list-group-flush">
                    ${Object.entries(vote.choices).map(([position, choice]) => 
                        `<li class="list-group-item"><strong>${position}:</strong> ${choice}</li>`
                    ).join('')}
                </ul>
                <div class="alert alert-info mt-3">
                    <strong>Note:</strong> Your vote has been recorded securely. Thank you for participating in the BSCpE Officer Elections!
                </div>
            `;
            
            showPage('receiptPage');
        }

        // Logout functionality
        function logout() {
            currentUser = null;
            currentEmail = null;
            showPage('loginPage');
            document.getElementById('loginForm').reset();
        }
