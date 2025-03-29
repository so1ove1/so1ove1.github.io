document.addEventListener('DOMContentLoaded', function () {
    const inputVector = document.getElementById('input-vector');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const groupsResult = document.getElementById('groups-result');
    const implicantsResult = document.getElementById('implicants-result');
    const dnfResult = document.getElementById('dnf-result');
    const errorVector = document.getElementById('error-vector');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Функция для проверки корректности вектора
    function isValidVector(vector) {
        return /^[01]+$/.test(vector) && isPowerOfTwo(vector.length);
    }

    // Функция для проверки, является ли число степенью двойки
    function isPowerOfTwo(n) {
        return n > 0 && (n & (n - 1)) === 0;
    }

    // Функция для подсчета единиц в двоичном числе
    function countOnes(binary) {
        return binary.split('').filter(bit => bit === '1').length;
    }

    // Функция для сравнения двух термов и нахождения позиции различия
    function findDifferingPosition(term1, term2) {
        if (term1.length !== term2.length) return -1;
        let diffPos = -1;
        let diffCount = 0;

        for (let i = 0; i < term1.length; i++) {
            if (term1[i] !== term2[i]) {
                diffPos = i;
                diffCount++;
                if (diffCount > 1) return -1;
            }
        }

        return diffCount === 1 ? diffPos : -1;
    }

    // Функция для проверки, покрывает ли импликант минтерм
    function coversMinterm(implicant, minterm) {
        for (let i = 0; i < implicant.length; i++) {
            if (implicant[i] !== '*' && implicant[i] !== minterm[i]) {
                return false;
            }
        }
        return true;
    }

    // Функция для преобразования импликанта в ДНФ терм
    function implicantToDNFTerm(implicant) {
        const vars = [];
        for (let i = 0; i < implicant.length; i++) {
            if (implicant[i] !== '*') {
                vars.push(implicant[i] === '0' ? `¬x${i + 1}` : `x${i + 1}`);
            }
        }
        return vars.join('');
    }

    // Основная функция алгоритма Квайна-МакКласки
    function quineMcCluskey(vector) {
        const n = Math.log2(vector.length);
        const minterms = [];
        
        // Собираем минтермы
        for (let i = 0; i < vector.length; i++) {
            if (vector[i] === '1') {
                let binary = i.toString(2);
                while (binary.length < n) {
                    binary = '0' + binary;
                }
                minterms.push(binary);
            }
        }

        // Группируем минтермы по количеству единиц
        const groups = [];
        for (let i = 0; i <= n; i++) {
            groups[i] = minterms.filter(term => countOnes(term) === i);
        }

        // Находим простые импликанты
        let currentGroups = groups;
        const primeImplicants = new Set();
        const usedTerms = new Set();

        while (true) {
            const nextGroups = Array(n).fill().map(() => []);
            let foundNew = false;

            // Сравниваем соседние группы
            for (let i = 0; i < currentGroups.length - 1; i++) {
                const currentGroup = currentGroups[i];
                const nextGroup = currentGroups[i + 1];

                for (let j = 0; j < currentGroup.length; j++) {
                    for (let k = 0; k < nextGroup.length; k++) {
                        const pos = findDifferingPosition(currentGroup[j], nextGroup[k]);
                        if (pos !== -1) {
                            const newTerm = currentGroup[j].split('');
                            newTerm[pos] = '*';
                            const newTermStr = newTerm.join('');
                            
                            nextGroups[i].push(newTermStr);
                            usedTerms.add(currentGroup[j]);
                            usedTerms.add(nextGroup[k]);
                            foundNew = true;
                        }
                    }
                }
            }

            // Добавляем неиспользованные термы в простые импликанты
            currentGroups.flat().forEach(term => {
                if (!usedTerms.has(term)) {
                    primeImplicants.add(term);
                }
            });

            if (!foundNew) break;
            currentGroups = nextGroups.filter(group => group.length > 0);
        }

        // Создаем таблицу покрытия
        const primeImplicantsArray = Array.from(primeImplicants);
        const coverageTable = minterms.map(minterm => 
            primeImplicantsArray.map(implicant => coversMinterm(implicant, minterm))
        );

        // Находим существенные простые импликанты
        const essentialImplicants = new Set();
        const coveredMinterms = new Set();

        minterms.forEach((minterm, mintermIndex) => {
            const coveringImplicants = primeImplicantsArray.reduce((acc, implicant, index) => {
                if (coverageTable[mintermIndex][index]) {
                    acc.push(index);
                }
                return acc;
            }, []);

            if (coveringImplicants.length === 1) {
                essentialImplicants.add(primeImplicantsArray[coveringImplicants[0]]);
                coveredMinterms.add(mintermIndex);
            }
        });

        return {
            groups: groups,
            primeImplicants: Array.from(primeImplicants),
            essentialImplicants: Array.from(essentialImplicants)
        };
    }

    // Обработчик нажатия кнопки
    calculateBtn.addEventListener('click', function() {
        const vector = inputVector.value.trim();
        errorVector.style.display = 'none';

        if (!isValidVector(vector)) {
            errorVector.textContent = 'Введите корректный вектор (длина должна быть степенью 2)';
            errorVector.style.display = 'block';
            return;
        }

        const result = quineMcCluskey(vector);

        // Отображение групп
        let groupsHtml = '<h4>Группы по количеству единиц:</h4>';
        groupsHtml += '<div class="group-table-container">';
        result.groups.forEach((group, index) => {
            if (group.length > 0) {
                groupsHtml += `<div class="group">
                    <h5>Группа ${index} (${group.length}):</h5>
                    <div class="group-terms">${group.join(', ')}</div>
                </div>`;
            }
        });
        groupsHtml += '</div>';
        groupsResult.innerHTML = groupsHtml;

        // Отображение простых импликант
        let implicantsHtml = '<h4>Простые импликанты:</h4>';
        result.primeImplicants.forEach(implicant => {
            implicantsHtml += `<div class="implicant">
                <span class="implicant-term">${implicant}</span>
                <span class="implicant-dnf">${implicantToDNFTerm(implicant)}</span>
            </div>`;
        });
        implicantsResult.innerHTML = implicantsHtml;

        // Отображение ДНФ
        let dnfHtml = '<h4>Минимальная ДНФ:</h4>';
        dnfHtml += '<div class="dnf-expression">';
        result.essentialImplicants.forEach((implicant, index) => {
            if (index > 0) {
                dnfHtml += '<span class="dnf-operator">∨</span>';
            }
            dnfHtml += `<span class="dnf-term">${implicantToDNFTerm(implicant)}</span>`;
        });
        dnfHtml += '</div>';
        dnfResult.innerHTML = dnfHtml;

        // Показать результаты
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});