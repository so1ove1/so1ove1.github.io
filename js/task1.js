document.addEventListener('DOMContentLoaded', function () {
    const inputN = document.getElementById('input-n');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const vectorResult = document.getElementById('vector-result');
    const truthTable = document.getElementById('truth-table');
    const errorMessage = document.getElementById('error-message');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Generate function
    generateBtn.addEventListener('click', function () {
        const n = parseInt(inputN.value);

        // Validate input
        if (isNaN(n) || n < 1 || n > 5) {
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';
        generateBooleanFunction(n);
        resultContainer.style.display = 'block';

        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function generateBooleanFunction(n) {
        // Calculate number of rows in truth table (2^n)
        const rows = Math.pow(2, n);

        // Generate random function vector (array of 0s and 1s)
        const functionVector = [];
        for (let i = 0; i < rows; i++) {
            functionVector.push(Math.round(Math.random()));
        }

        // Display vector
        vectorResult.textContent = functionVector.join('');

        // Generate truth table
        generateTruthTable(n, functionVector);
    }

    function generateTruthTable(n, functionVector) {
        // Clear previous table
        truthTable.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        
        // Add variable headers (x1, x2, ..., xn)
        for (let i = 1; i <= n; i++) {
            const th = document.createElement('th');
            th.textContent = `x${i}`;
            headerRow.appendChild(th);
        }

        // Add function result header
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f';
        headerRow.appendChild(resultTh);
        
        truthTable.appendChild(headerRow);

        // Create data rows
        const rows = Math.pow(2, n);
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            
            // Convert row index to binary and pad with zeros
            let binaryStr = i.toString(2);
            while (binaryStr.length < n) {
                binaryStr = '0' + binaryStr;
            }
            
            // Add variable values (0 or 1)
            for (let j = 0; j < n; j++) {
                const td = document.createElement('td');
                td.textContent = binaryStr[j];
                row.appendChild(td);
            }
            
            // Add function result
            const resultTd = document.createElement('td');
            resultTd.textContent = functionVector[i];
            row.appendChild(resultTd);
            
            truthTable.appendChild(row);
        }
    }
});