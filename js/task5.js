document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM
    const functionVector = document.getElementById('function-vector');
    const truthTableBody = document.getElementById('truth-table-body');
    const checkAnswerBtn = document.getElementById('check-answer');
    const nextRoundBtn = document.getElementById('next-round');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const correctAnswerContainer = document.getElementById('correct-answer-container');
    const correctVariablesList = document.getElementById('correct-variables');
    const functionDescription = document.getElementById('function-description');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toast-content');
    const variableOptions = document.querySelectorAll('.variable-option');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    // Инициализация счетчиков
    let correctCount = 0;
    let totalCount = 0;
    
    // Текущая функция
    let currentFunction = null;
    
    // Счетчики обновляем в localStorage
    if (localStorage.getItem('varGame_correctCount')) {
        correctCount = parseInt(localStorage.getItem('varGame_correctCount'));
        correctCountEl.textContent = correctCount;
    }
    
    if (localStorage.getItem('varGame_totalCount')) {
        totalCount = parseInt(localStorage.getItem('varGame_totalCount'));
        totalCountEl.textContent = totalCount;
    }

    // Функция для создания бинарной анимации
    function createBinaryAnimation() {
        const binaryBackground = document.getElementById("binary-background");
        if (binaryBackground) {
            // Количество цифр
            const digitCount = 30;
            
            // Создаем начальные цифры
            for (let i = 0; i < digitCount; i++) {
                createBinaryDigit(binaryBackground);
            }
            
            // Продолжаем создавать цифры с интервалом
            setInterval(() => {
                if (document.visibilityState === "visible") {
                    createBinaryDigit(binaryBackground);
                }
            }, 1000);
        }
    }
    
    // Функция для создания одной бинарной цифры
    function createBinaryDigit(container) {
        // Создаем новый элемент
        const digit = document.createElement("div");
        digit.className = "binary-digit";
        
        // Случайно выбираем 0 или 1
        digit.textContent = Math.random() > 0.5 ? "0" : "1";
        
        // Случайное положение, размер и продолжительность анимации
        const size = Math.floor(Math.random() * 20) + 10; // 10-30px
        const left = Math.random() * 100; // 0-100%
        const animationDuration = Math.random() * 10 + 5; // 5-15s
        const delay = Math.random() * 2; // 0-2s
        
        // Применяем стили
        digit.style.fontSize = `${size}px`;
        digit.style.left = `${left}%`;
        digit.style.bottom = "-50px";
        digit.style.animationDuration = `${animationDuration}s`;
        digit.style.animationDelay = `${delay}s`;
        
        // Добавляем в контейнер
        container.appendChild(digit);
        
        // Удаляем после завершения анимации
        setTimeout(() => {
            if (container.contains(digit)) {
                container.removeChild(digit);
            }
        }, (animationDuration + delay) * 1000);
    }

    // Инициализируем бинарную анимацию
    createBinaryAnimation();
    
    // Обработчик мобильного меню
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем класс active со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем класс active к выбранной вкладке
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Выбор переменных (обработка клика на блок)
    variableOptions.forEach(option => {
        option.addEventListener('click', function() {
            const checkbox = option.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            option.classList.toggle('selected', checkbox.checked);
        });
    });
    
    // Предотвращаем двойное срабатывание клика на чекбоксе
    document.querySelectorAll('.var-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation();
            const option = this.closest('.variable-option');
            option.classList.toggle('selected', this.checked);
        });
    });
    
    // Функция для генерации случайного вектора булевой функции (8 значений для 3 переменных)
    function generateRandomFunction() {
        const vars = 3; // количество переменных
        const vectorLength = Math.pow(2, vars);
        let vector = '';
        
        // Генерируем случайный вектор
        for (let i = 0; i < vectorLength; i++) {
            vector += Math.random() > 0.5 ? '1' : '0';
        }
        
        // Определяем существенные переменные
        const essentialVars = findEssentialVariables(vector);
        
        return {
            vector: vector,
            essentialVars: essentialVars
        };
    }
    
    // Функция для определения существенных переменных
    function findEssentialVariables(vector) {
        const essentialVars = [];
        const vars = 3; // количество переменных
        
        // Проверяем каждую переменную на существенность
        for (let i = 0; i < vars; i++) {
            if (isEssentialVariable(vector, i)) {
                essentialVars.push(i + 1); // +1 потому что нумеруем с 1, а не с 0
            }
        }
        
        return essentialVars;
    }
    
    // Функция для проверки, является ли переменная существенной
    function isEssentialVariable(vector, varIndex) {
        const vars = 3; // количество переменных
        
        // Перебираем все возможные наборы значений переменных
        for (let i = 0; i < Math.pow(2, vars); i++) {
            // Преобразуем i в двоичный вид и дополняем нулями слева
            let binary = i.toString(2);
            while (binary.length < vars) {
                binary = '0' + binary;
            }
            
            // Создаем набор, в котором меняется только проверяемая переменная
            let changedBinary = binary.split('');
            changedBinary[varIndex] = binary[varIndex] === '0' ? '1' : '0';
            changedBinary = changedBinary.join('');
            
            // Преобразуем двоичные строки в десятичные индексы для вектора
            const index1 = parseInt(binary, 2);
            const index2 = parseInt(changedBinary, 2);
            
            // Если значения функции различаются при изменении переменной,
            // то переменная существенная
            if (vector[index1] !== vector[index2]) {
                return true;
            }
        }
        
        // Если мы дошли до этой точки, переменная не влияет на функцию
        return false;
    }
    
    // Функция для отображения таблицы истинности
    function displayTruthTable(vector) {
        // Очищаем таблицу
        truthTableBody.innerHTML = '';
        
        // Для каждой строки таблицы (всего 8 строк для 3 переменных)
        for (let i = 0; i < 8; i++) {
            // Преобразуем i в двоичный вид и дополняем нулями слева
            let binary = i.toString(2);
            while (binary.length < 3) {
                binary = '0' + binary;
            }
            
            // Создаем строку таблицы
            const row = document.createElement('tr');
            
            // Добавляем ячейки для значений переменных
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('td');
                cell.textContent = binary[j];
                row.appendChild(cell);
            }
            
            // Добавляем ячейку для значения функции
            const resultCell = document.createElement('td');
            resultCell.textContent = vector[i];
            row.appendChild(resultCell);
            
            // Добавляем строку в таблицу
            truthTableBody.appendChild(row);
        }
    }
    
    // Функция для запуска нового раунда
    function startNewRound() {
        // Генерируем новую функцию
        currentFunction = generateRandomFunction();
        
        // Отображаем вектор
        functionVector.textContent = currentFunction.vector;
        
        // Отображаем таблицу истинности
        displayTruthTable(currentFunction.vector);
        
        // Очищаем выбранные переменные
        document.querySelectorAll('.var-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.variable-option').classList.remove('selected');
        });
        
        // Скрываем результат
        resultContainer.classList.add('hidden');
        correctAnswerContainer.classList.add('hidden');
        
        // Сбрасываем вкладки (показываем вектор)
        tabs[0].click();
        
        // Убираем пульсацию и снова добавляем ее (для перезапуска анимации)
        functionVector.classList.remove('animate-pulse');
        setTimeout(() => {
            functionVector.classList.add('animate-pulse');
        }, 10);
    }
    
    // Функция для проверки ответа
    function checkAnswer() {
        // Получаем выбранные переменные
        const selectedVars = [];
        document.querySelectorAll('.var-checkbox').forEach((checkbox, index) => {
            if (checkbox.checked) {
                selectedVars.push(index + 1); // +1 потому что нумеруем с 1, а не с 0
            }
        });
        
        // Сравниваем с правильным ответом
        const isCorrect = arraysEqual(selectedVars.sort(), currentFunction.essentialVars.sort());
        
        // Обновляем счетчики
        totalCount++;
        if (isCorrect) {
            correctCount++;
        }
        
        // Обновляем отображение счетчиков
        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;
        
        // Сохраняем счетчики в localStorage
        localStorage.setItem('varGame_correctCount', correctCount);
        localStorage.setItem('varGame_totalCount', totalCount);
        
        // Отображаем результат
        resultContainer.classList.remove('hidden');
        
        if (isCorrect) {
            resultMessage.textContent = 'Верно! Вы правильно определили существенные переменные.';
            resultMessage.className = 'correct';
            showToast('Правильно!', 'success');
        } else {
            resultMessage.textContent = 'Неверно. Правильный ответ:';
            resultMessage.className = 'incorrect';
            correctAnswerContainer.classList.remove('hidden');
            
            // Отображаем правильный ответ
            correctVariablesList.innerHTML = '';
            
            if (currentFunction.essentialVars.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Нет существенных переменных (все переменные фиктивные)';
                correctVariablesList.appendChild(li);
            } else {
                currentFunction.essentialVars.forEach(varIndex => {
                    const li = document.createElement('li');
                    li.textContent = `x${varIndex} - существенная`;
                    correctVariablesList.appendChild(li);
                });
            }
            
            // Добавляем фиктивные переменные в список
            const fakeVars = [1, 2, 3].filter(v => !currentFunction.essentialVars.includes(v));
            if (fakeVars.length > 0) {
                fakeVars.forEach(varIndex => {
                    const li = document.createElement('li');
                    li.textContent = `x${varIndex} - фиктивная`;
                    correctVariablesList.appendChild(li);
                });
            }
            
            showToast('Неверно. Попробуйте еще раз.', 'error');
        }
        
        // Описание функции
        let description = '';
        if (currentFunction.essentialVars.length === 0) {
            description = 'Эта функция является константой (не зависит ни от одной переменной).';
        } else if (currentFunction.essentialVars.length === 1) {
            description = `Эта функция зависит только от переменной x${currentFunction.essentialVars[0]}.`;
        } else {
            description = `Эта функция зависит от переменных: ${currentFunction.essentialVars.map(v => `x${v}`).join(', ')}.`;
        }
        
        functionDescription.textContent = description;
    }
    
    // Функция для сравнения массивов
    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    
    // Функция для отображения всплывающего уведомления
    function showToast(message, type = '') {
        toastContent.textContent = message;
        toast.className = 'toast';
        
        if (type) {
            toast.classList.add(type);
        }
        
        // Показываем тост
        setTimeout(() => {
            toast.classList.add('visible');
        }, 100);
        
        // Скрываем через 3 секунды
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
    
    // Обработчики событий
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextRoundBtn.addEventListener('click', startNewRound);
    
    // Запускаем первый раунд
    startNewRound();
});
