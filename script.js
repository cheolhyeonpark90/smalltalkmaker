document.addEventListener('DOMContentLoaded', () => {

    // 애플리케이션 초기화 함수
    const initializeApp = (topics) => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const generateBtn = document.getElementById('generate-btn');
        
        const topicCard = document.getElementById('topic-card');
        const placeholderText = document.getElementById('placeholder-text');
        const topicContent = document.getElementById('topic-content');
        const topicCategory = document.getElementById('topic-category');
        const topicText = document.getElementById('topic-text');
        const cardActions = document.getElementById('card-actions');
        
        const nextTopicBtn = document.getElementById('next-topic-btn');
        const shareBtn = document.getElementById('share-btn');
        const saveImageBtn = document.getElementById('save-image-btn');

        let selectedFilters = {
            relationship: null,
            intimacy: null,
            mood: [] // Mood can have multiple values
        };
        let currentFilteredTopics = [];
        let lastDisplayedTopic = null;

        // 친밀도 계층 정의
        const intimacyHierarchy = {
            '초면': ['초면'],
            '애매한 사이': ['초면', '애매한 사이'],
            '친해지는중': ['초면', '애매한 사이', '친해지는중'],
            '절친': ['초면', '애매한 사이', '친해지는중', '절친']
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                const value = button.dataset.value;

                if (filter === 'mood') {
                    // Handle multi-select for mood
                    button.classList.toggle('active');
                    const index = selectedFilters.mood.indexOf(value);
                    if (index > -1) {
                        selectedFilters.mood.splice(index, 1); // Remove if it exists
                    } else {
                        selectedFilters.mood.push(value); // Add if it doesn't exist
                    }
                } else {
                    // Handle single-select for relationship and intimacy
                    const sameGroupButtons = document.querySelectorAll(`.filter-btn[data-filter="${filter}"]`);
                    if (button.classList.contains('active')) {
                        // Deselecting the current button
                        button.classList.remove('active');
                        selectedFilters[filter] = null;
                    } else {
                        // Selecting a new button
                        sameGroupButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        selectedFilters[filter] = value;
                    }
                }
            });
        });

        const getFilteredTopics = () => {
            // 사용자가 선택한 친밀도에 따라 허용되는 모든 레벨을 가져옴
            const allowedIntimacyLevels = selectedFilters.intimacy ? intimacyHierarchy[selectedFilters.intimacy] : null;

            return topics.filter(topic => {
                // 관계 필터 로직은 동일
                const relationshipOK = !selectedFilters.relationship || (topic.tags.relationship && topic.tags.relationship.includes(selectedFilters.relationship));
                
                // 새로 수정된 친밀도 필터 로직
                const topicIntimacyTags = topic.tags.intimacy || [];
                // 친밀도 필터가 선택되지 않았으면 통과
                // 선택되었다면, 주제의 친밀도 태그 중 하나라도 허용된 레벨에 포함되는지 확인
                const intimacyOK = !allowedIntimacyLevels ? true : topicIntimacyTags.some(tag => allowedIntimacyLevels.includes(tag));

                // 분위기 필터 로직은 동일
                const topicMoods = topic.tags.mood || [];
                const moodOK = selectedFilters.mood.length === 0 ? true : selectedFilters.mood.some(selectedMood => topicMoods.includes(selectedMood));

                return relationshipOK && intimacyOK && moodOK;
            });
        };

        const displayTopic = (topic) => {
            if (topic) {
                lastDisplayedTopic = topic;
                placeholderText.classList.add('hidden');
                topicContent.classList.remove('hidden');
                topicContent.classList.add('fade-in');
                topicCategory.textContent = topic.category;
                topicText.textContent = topic.text;
                cardActions.classList.remove('hidden');
                
                topicContent.addEventListener('animationend', () => {
                    topicContent.classList.remove('fade-in');
                }, { once: true });
            } else {
                displayError();
            }
        };
        
        const displayError = (message = "조건에 맞는 주제가 없어요. <br> 필터를 변경하고 다시 시도해보세요!") => {
            lastDisplayedTopic = null;
            placeholderText.classList.remove('hidden');
            topicContent.classList.add('hidden');
            cardActions.classList.add('hidden');
            placeholderText.innerHTML = message;
        }

        const generateNewTopic = () => {
            currentFilteredTopics = getFilteredTopics();

            if (currentFilteredTopics.length > 0) {
                let newTopic;
                if (currentFilteredTopics.length > 1 && lastDisplayedTopic) {
                     const availableTopics = currentFilteredTopics.filter(t => t.id !== lastDisplayedTopic.id);
                     newTopic = availableTopics.length > 0 ? availableTopics[Math.floor(Math.random() * availableTopics.length)] : currentFilteredTopics[0];
                } else {
                    newTopic = currentFilteredTopics[Math.floor(Math.random() * currentFilteredTopics.length)];
                }
                displayTopic(newTopic);
            } else {
                displayError();
            }
        };
        
        generateBtn.addEventListener('click', () => {
            const anyFilterSelected = Object.values(selectedFilters).some(v => v !== null && (Array.isArray(v) ? v.length > 0 : true));
            if (!anyFilterSelected) {
                displayError("먼저 필터를 1개 이상 선택해주세요!");
                return;
            }
            generateNewTopic();
        });
        
        nextTopicBtn.addEventListener('click', () => {
            generateNewTopic();
        });

        saveImageBtn.addEventListener('click', () => {
            if (window.html2canvas && lastDisplayedTopic) {
                html2canvas(topicCard, { 
                    backgroundColor: '#F7F3EE',
                    onclone: (document) => {
                        document.getElementById('topic-card').style.boxShadow = 'none';
                    }
                 }).then(canvas => {
                    const image = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = 'talk-topic.png';
                    link.click();
                });
            }
        });

        shareBtn.addEventListener('click', async () => {
            if (lastDisplayedTopic) {
                const shareData = {
                    title: '이런 대화 어때요? - 대화 주제 생성기',
                    text: `"${lastDisplayedTopic.text}"`,
                    url: window.location.href
                };
                
                try {
                     if (navigator.share) {
                         await navigator.share(shareData);
                     } else {
                         const textToCopy = `${shareData.text}\n\n출처: ${shareData.url}`;
                         const tempInput = document.createElement('textarea');
                         tempInput.value = textToCopy;
                         document.body.appendChild(tempInput);
                         tempInput.select();
                         document.execCommand('copy');
                         document.body.removeChild(tempInput);
                         alert('클립보드에 내용이 복사되었습니다!');
                     }
                } catch (err) {
                    console.error("Share/Copy failed:", err.message);
                }
            }
        });
    };

    // data.json 파일을 fetch API로 불러옵니다.
    fetch('./data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(topics => {
            // 데이터를 성공적으로 불러온 후, 앱을 초기화합니다.
            initializeApp(topics);
        })
        .catch(error => {
            console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
            const placeholderText = document.getElementById('placeholder-text');
            if(placeholderText) {
                placeholderText.innerHTML = "주제 데이터를 불러오는 데 실패했습니다.<br>파일이 올바른 경로에 있는지 확인해주세요.";
            }
        });
});
