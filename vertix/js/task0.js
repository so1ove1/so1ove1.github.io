import Graph from './graph.js';

document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const matrixContainer = document.getElementById('matrix-container');
    const analyzeGraphBtn = document.getElementById('analyze-graph');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');
    const representationSelect = document.getElementById('graph-representation');

    // Элементы управления отображением
    const viewDefaultBtn = document.getElementById('view-default');
    const viewComponentsBtn = document.getElementById('view-components');
    const viewBipartiteBtn = document.getElementById('view-bipartite');

    // Элементы для вывода результатов
    const degreesResult = document.getElementById('degrees-result');
    const componentsResult = document.getElementById('components-result');
    const eulerianResult = document.getElementById('eulerian-result');
    const bipartiteResult = document.getElementById('bipartite-result');

    // Экземпляр графа и данные
    let graph = new Graph();
    let currentMatrix = []; // Текущая матрица смежности
    let currentIncidenceMatrix = []; // Текущая матрица инцидентности
    let currentAdjLists = []; // Текущие списки смежности
    let analysisResults = { // Результаты анализа графа
        degrees: [], // Степени вершин
        components: [], // Компоненты связности
        eulerian: null, // Эйлеровы свойства
        bipartite: null // Двудольные свойства
    };

    // Инициализация canvas сразу после загрузки
    initCanvas();

    // Инициализация canvas для отрисовки графа
    function initCanvas() {
        if (!graphCanvas) return;

        // Установка размеров canvas в зависимости от размеров контейнера
        const container = graphCanvas.parentElement;
        const containerWidth = container.clientWidth;

        // Сохранение пропорций
        const size = Math.min(containerWidth, 600);
        graphCanvas.width = size;
        graphCanvas.height = size;

        // Настройка графа с canvas
        graph.setCanvas(graphCanvas);

        // Показываем контейнер с результатами, если он был скрыт
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
        }

        // Отрисовка пустого графа
        graph.draw();
    }

    // Генерация формы ввода в зависимости от выбранного представления
    function generateInput(size) {
        if (size < 1 || size > 20) {
            alert('Размер матрицы должен быть от 1 до 20');
            return;
        }

        const representation = representationSelect.value;

        switch (representation) {
            case 'adjacency':
                generateAdjacencyMatrix(size); // Матрица смежности
                break;
            case 'incidence':
                generateIncidenceMatrix(size); // Матрица инцидентности
                break;
            case 'lists':
                generateAdjacencyLists(size); // Списки смежности
                break;
        }

        // Активируем кнопки анализа и сброса
        analyzeGraphBtn.disabled = false;
        resetMatrixBtn.disabled = false;

        // Инициализация canvas с новым размером
        initCanvas();
    }

    // Генерация формы ввода для матрицы смежности
    function generateAdjacencyMatrix(size) {
        currentMatrix = graph.createAdjacencyMatrix(size);

        let tableHTML = '<table class="matrix-table">';
        tableHTML += '<tr><th></th>';
        for (let i = 0; i < size; i++) {
            tableHTML += `<th>${i + 1}</th>`;
        }
        tableHTML += '</tr>';

        for (let i = 0; i < size; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < size; j++) {
                tableHTML += `<td><div class="matrix-cell" data-row="${i}" data-col="${j}">0</div></td>`;
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</table>';
        matrixContainer.innerHTML = tableHTML;

        // Добавляем обработчики кликов для ячеек
        const cells = document.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', toggleAdjacencyCell);
        });
    }

    // Генерация формы ввода для матрицы инцидентности
    function generateIncidenceMatrix(size) {
        currentIncidenceMatrix = graph.createIncidenceMatrix(size);
        const maxEdges = (size * (size - 1)) / 2; // Максимальное количество ребер

        let tableHTML = '<table class="matrix-table">';
        tableHTML += '<tr><th>V\\E</th>';
        for (let i = 0; i < maxEdges; i++) {
            tableHTML += `<th>e${i + 1}</th>`;
        }
        tableHTML += '</tr>';

        for (let i = 0; i < size; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < maxEdges; j++) {
                tableHTML += `<td><div class="matrix-cell incidence" data-vertex="${i}" data-edge="${j}">0</div></td>`;
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</table>';
        matrixContainer.innerHTML = tableHTML;

        // Добавляем обработчики кликов для ячеек
        const cells = document.querySelectorAll('.matrix-cell.incidence');
        cells.forEach(cell => {
            cell.addEventListener('click', toggleIncidenceCell);
        });
    }

    // Генерация формы ввода для списков смежности
    function generateAdjacencyLists(size) {
        currentAdjLists = graph.createAdjacencyLists(size);

        let html = '<div class="adjacency-lists">';
        for (let i = 0; i < size; i++) {
            html += `
                <div class="list-row">
                    <span class="vertex-label">${i + 1}:</span>
                    <input type="text" class="list-input" data-vertex="${i}" 
                           placeholder="Введите номера смежных вершин через пробел">
                </div>
            `;
        }
        html += '</div>';

        matrixContainer.innerHTML = html;

        // Добавляем обработчики изменений для полей ввода
        const inputs = document.querySelectorAll('.list-input');
        inputs.forEach(input => {
            input.addEventListener('change', updateAdjacencyList);
        });
    }

    // Переключение значения ячейки матрицы смежности
    function toggleAdjacencyCell(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Инвертируем значение ячейки
        currentMatrix[row][col] = currentMatrix[row][col] === 0 ? 1 : 0;
        cell.textContent = currentMatrix[row][col];
        cell.classList.toggle('active', currentMatrix[row][col] === 1);

        // Для неориентированного графа обновляем симметричную ячейку
        if (row !== col) {
            const symmetricCell = document.querySelector(`.matrix-cell[data-row="${col}"][data-col="${row}"]`);
            currentMatrix[col][row] = currentMatrix[row][col];
            symmetricCell.textContent = currentMatrix[col][row];
            symmetricCell.classList.toggle('active', currentMatrix[col][row] === 1);
        }

        // Обновляем визуализацию графа
        graph.loadFromAdjacencyMatrix(currentMatrix);
        graph.draw();
    }

    // Переключение значения ячейки матрицы инцидентности
    function toggleIncidenceCell(event) {
        const cell = event.target;
        const vertex = parseInt(cell.dataset.vertex);
        const edge = parseInt(cell.dataset.edge);

        // Циклически меняем значение ячейки (0 → 1 → 0)
        const currentValue = parseInt(cell.textContent);
        const newValue = (currentValue + 1) % 2;

        currentIncidenceMatrix[vertex][edge] = newValue;
        cell.textContent = newValue;
        cell.classList.toggle('active', newValue === 1);

        // Конвертируем в матрицу смежности и обновляем граф
        graph.loadFromIncidenceMatrix(currentIncidenceMatrix);
        graph.draw();
    }

    // Обновление списка смежности
    function updateAdjacencyList(event) {
        const input = event.target;
        const vertex = parseInt(input.dataset.vertex);
        const values = input.value.trim().split(/\s+/).map(v => parseInt(v) - 1); // Преобразуем в индексы (0-based)

        // Проверка ввода
        if (values.some(v => isNaN(v) || v < 0 || v >= currentAdjLists.length)) {
            alert('Неверный формат ввода. Используйте числа от 1 до ' + currentAdjLists.length);
            return;
        }

        currentAdjLists[vertex] = values;

        // Обновляем визуализацию графа
        graph.loadFromAdjacencyLists(currentAdjLists);
        graph.draw();
    }

    // Сброс текущего представления графа
    function resetInput() {
        const size = parseInt(matrixSizeInput.value);
        const representation = representationSelect.value;

        switch (representation) {
            case 'adjacency':
                currentMatrix = graph.createAdjacencyMatrix(size);
                document.querySelectorAll('.matrix-cell').forEach(cell => {
                    cell.textContent = '0';
                    cell.classList.remove('active');
                });
                graph.loadFromAdjacencyMatrix(currentMatrix);
                break;

            case 'incidence':
                currentIncidenceMatrix = graph.createIncidenceMatrix(size);
                document.querySelectorAll('.matrix-cell.incidence').forEach(cell => {
                    cell.textContent = '0';
                    cell.classList.remove('active');
                });
                graph.loadFromIncidenceMatrix(currentIncidenceMatrix);
                break;

            case 'lists':
                currentAdjLists = graph.createAdjacencyLists(size);
                document.querySelectorAll('.list-input').forEach(input => {
                    input.value = '';
                });
                graph.loadFromAdjacencyLists(currentAdjLists);
                break;
        }

        graph.draw();
    }

    // Загрузка примера графа
    function loadExample() {
        const exampleSize = 6;
        matrixSizeInput.value = exampleSize;

        // Пример матрицы смежности
        const example = [
            [0, 1, 0, 0, 1, 0],
            [1, 0, 1, 0, 0, 0],
            [0, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 1, 0],
            [1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0]
        ];

        representationSelect.value = 'adjacency';
        generateInput(exampleSize);

        // Заполняем матрицу примера
        for (let i = 0; i < exampleSize; i++) {
            for (let j = 0; j < exampleSize; j++) {
                currentMatrix[i][j] = example[i][j];
                const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = example[i][j];
                cell.classList.toggle('active', example[i][j] === 1);
            }
        }

        graph.loadFromAdjacencyMatrix(currentMatrix);
        graph.draw();
    }

    // Анализ графа
    function analyzeGraph() {
        let adjMatrix;
        const representation = representationSelect.value;

        // Конвертируем текущее представление в матрицу смежности
        switch (representation) {
            case 'adjacency':
                adjMatrix = currentMatrix;
                break;
            case 'incidence':
                adjMatrix = graph.incidenceToAdjacency(currentIncidenceMatrix);
                break;
            case 'lists':
                adjMatrix = graph.listsToAdjacency(currentAdjLists);
                break;
        }

        graph.loadFromAdjacencyMatrix(adjMatrix);

        // Вычисляем свойства графа
        const degrees = graph.calculateDegrees();
        const components = graph.findConnectedComponents();
        const eulerianProps = graph.isEulerian();
        const bipartiteProps = graph.isBipartite();

        analysisResults = {
            degrees,
            components,
            eulerian: eulerianProps,
            bipartite: bipartiteProps
        };

        displayResults();
        graph.draw();
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Функции отображения результатов
    function displayResults() {
        displayDegrees();
        displayComponents();
        displayEulerian();
        displayBipartite();
    }

    // Отображение степеней вершин
    function displayDegrees() {
        const degrees = analysisResults.degrees;

        let html = '<ul>';
        for (let i = 0; i < degrees.length; i++) {
            html += `<li>Вершина ${i + 1}: <strong>${degrees[i]}</strong></li>`;
        }
        html += '</ul>';

        degreesResult.innerHTML = html;
    }

    // Отображение компонент связности
    function displayComponents() {
        const components = analysisResults.components;

        let html = `<p>Количество компонент связности: <strong>${components.length}</strong></p>`;
        html += '<ul>';

        for (let i = 0; i < components.length; i++) {
            const vertices = components[i].map(v => v + 1).join(', ');
            html += `<li>Компонента ${i + 1}: {${vertices}}</li>`;
        }
        html += '</ul>';

        componentsResult.innerHTML = html;
    }

    // Отображение эйлеровых свойств
    function displayEulerian() {
        const eulerian = analysisResults.eulerian;

        let html = '';

        if (eulerian.isEulerian) {
            html += `<p><span class="tag positive">Эйлеров граф</span></p>`;
            html += `<p>Граф содержит эйлеров цикл (замкнутый путь, проходящий через каждое ребро ровно один раз).</p>`;
        } else if (eulerian.isSemiEulerian) {
            html += `<p><span class="tag neutral">Полуэйлеров граф</span></p>`;
            html += `<p>Граф содержит эйлеров путь (незамкнутый путь, проходящий через каждое ребро ровно один раз).</p>`;
        } else {
            html += `<p><span class="tag negative">Не эйлеров граф</span></p>`;
            html += `<p>Граф не содержит эйлеров путь или цикл.</p>`;
        }

        html += `<p>Причина: ${eulerian.reason}</p>`;

        eulerianResult.innerHTML = html;
    }

    // Отображение двудольных свойств
    function displayBipartite() {
        const bipartite = analysisResults.bipartite;

        let html = '';

        if (!bipartite) {
            html += `<p><span class="tag negative">Не определено</span></p>`;
            bipartiteResult.innerHTML = html;
            return;
        }

        if (bipartite.isBipartite) {
            if (bipartite.isCompleteBipartite) {
                html += `<p><span class="tag positive">Полный двудольный граф</span></p>`;
                html += `<p>Граф является двудольным, и каждая вершина из первого множества соединена с каждой вершиной из второго множества.</p>`;
            } else {
                html += `<p><span class="tag positive">Двудольный граф</span></p>`;
                html += `<p>Вершины графа можно разделить на два непересекающихся множества так, что каждое ребро соединяет вершины из разных множеств.</p>`;
            }

            if (bipartite.sets) {
                const set1 = bipartite.sets[0].map(v => v + 1).join(', ');
                const set2 = bipartite.sets[1].map(v => v + 1).join(', ');

                html += '<ul>';
                html += `<li>Множество 1: {${set1 || 'пусто'}}</li>`;
                html += `<li>Множество 2: {${set2 || 'пусто'}}</li>`;
                html += '</ul>';
            }
        } else {
            html += `<p><span class="tag negative">Не двудольный граф</span></p>`;
            html += `<p>Вершины графа нельзя разделить на два множества так, чтобы ребра соединяли только вершины из разных множеств.</p>`;
        }

        bipartiteResult.innerHTML = html;
    }

    // Обработчики событий
    generateMatrixBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeInput.value);
        generateInput(size);
    });

    representationSelect.addEventListener('change', () => {
        const size = parseInt(matrixSizeInput.value);
        generateInput(size);
    });

    analyzeGraphBtn.addEventListener('click', analyzeGraph);
    resetMatrixBtn.addEventListener('click', resetInput);
    loadExampleBtn.addEventListener('click', loadExample);

    // Обработчики для кнопок отображения
    viewDefaultBtn.addEventListener('click', () => graph.draw());
    viewComponentsBtn.addEventListener('click', () => {
        if (analysisResults.components.length > 0) {
            graph.drawConnectedComponents(analysisResults.components);
        }
    });
    viewBipartiteBtn.addEventListener('click', () => {
        if (analysisResults.bipartite && analysisResults.bipartite.isBipartite) {
            graph.drawBipartiteGraph(analysisResults.bipartite);
        }
    });

    // Обработчик изменения размера окна
    window.addEventListener('resize', initCanvas);
});