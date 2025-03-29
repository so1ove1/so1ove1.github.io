document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const inputFunction = document.getElementById('input-function');
    const varsCount = document.getElementById('vars-count');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const dnfResult = document.getElementById('dnf-result');
    const stepsResult = document.getElementById('steps-result');
    const truthTable = document.getElementById('truth-table');
    const errorFunction = document.getElementById('error-function');
    const errorVars = document.getElementById('error-vars');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching logic
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

    // Calculate button click event
    calculateBtn.addEventListener('click', function () {
        // Reset error messages
        errorFunction.style.display = 'none';
        errorVars.style.display = 'none';

        // Get input values
        const functionStr = inputFunction.value.trim();
        const vars = parseInt(varsCount.value);

        // Validate inputs
        let hasError = false;

        if (!functionStr) {
            errorFunction.textContent = 'Введите булеву функцию';
            errorFunction.style.display = 'block';
            hasError = true;
        }

        if (isNaN(vars) || vars < 1 || vars > 5) {
            errorVars.textContent = 'Введите число от 1 до 5';
            errorVars.style.display = 'block';
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            // Parse the function
            const { truthTableValues, variableNames } = parseBooleanFunction(functionStr, vars);
            
            // Build the DNF
            const { dnf, steps } = buildDNF(truthTableValues, variableNames);
            
            // Display results
            displayResults(dnf, steps, truthTableValues, variableNames);
            
            // Show result container
            resultContainer.style.display = 'block';
            
            // Scroll to results
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            errorFunction.textContent = error.message;
            errorFunction.style.display = 'block';
        }
    });

    // Parse the boolean function and generate a truth table
    function parseBooleanFunction(functionStr, varsCount) {
        // Create variable names (x1, x2, ...)
        const variableNames = Array.from({ length: varsCount }, (_, i) => `x${i + 1}`);
        
        // Replace operators with JavaScript operators
        let jsFunction = functionStr
            .replace(/&/g, '&&')
            .replace(/\|/g, '||')
            .replace(/!/g, '!')
            .replace(/->/g, '<=')
            .replace(/<->/g, '===')
            .replace(/\^/g, '!==');
        
        // Generate truth table values
        const truthTableValues = [];
        const rows = Math.pow(2, varsCount);
        
        for (let i = 0; i < rows; i++) {
            // Convert row index to binary string
            let binaryStr = i.toString(2);
            while (binaryStr.length < varsCount) {
                binaryStr = '0' + binaryStr;
            }
            
            // Create variable assignments
            const assignment = {};
            for (let j = 0; j < varsCount; j++) {
                assignment[variableNames[j]] = binaryStr[j] === '1';
            }
            
            // Evaluate the function for this assignment
            try {
                // Create a function that evaluates the boolean expression
                const evalFunction = new Function(...variableNames, `return ${jsFunction};`);
                
                // Call the function with the variable values
                const result = evalFunction(...variableNames.map(name => assignment[name]));
                
                // Add to truth table values
                truthTableValues.push({
                    assignment,
                    result: Boolean(result)
                });
            } catch (error) {
                throw new Error('Ошибка в синтаксисе функции. Проверьте правильность ввода.');
            }
        }
        
        return { truthTableValues, variableNames };
    }

    // Build DNF from truth table
    function buildDNF(truthTableValues, variableNames) {
        const steps = [];
        let minterms = [];

        // Find all minterms (rows where function equals 1)
        truthTableValues.forEach(row => {
            if (row.result) {
                // Create minterm
                const terms = [];
                for (const varName of variableNames) {
                    terms.push(row.assignment[varName] ? varName : `!${varName}`);
                }
                minterms.push(terms);
            }
        });

        // Add initial step
        steps.push({
            description: 'Определение строк таблицы истинности, где функция равна 1',
            expression: minterms.length > 0 
                ? minterms.map(term => `(${term.join(' & ')})`).join(' | ')
                : '0' // If no minterms, function is constant 0
        });

        // If function is constant (all 0s or all 1s), handle specially
        if (minterms.length === 0) {
            return { 
                dnf: '0', 
                steps 
            };
        } else if (minterms.length === truthTableValues.length) {
            steps.push({
                description: 'Функция тождественно равна 1',
                expression: '1'
            });
            return { 
                dnf: '1', 
                steps 
            };
        }

        // Convert minterms to DNF string
        const dnf = minterms.map(term => `(${term.join(' & ')})`).join(' | ');
        
        // If we have only one minterm, we're done
        if (minterms.length === 1) {
            steps.push({
                description: 'ДНФ получена',
                expression: dnf
            });
            return { dnf, steps };
        }

        // Check if we can simplify using absorption laws
        const simplified = simplifyMinterms(minterms, variableNames);
        if (simplified !== dnf) {
            steps.push({
                description: 'Упрощение с использованием законов поглощения',
                expression: simplified
            });
            return { dnf: simplified, steps };
        }

        // No simplification possible
        steps.push({
            description: 'ДНФ получена',
            expression: dnf
        });
        
        return { dnf, steps };
    }

    // Simplify minterms using absorption laws
    function simplifyMinterms(minterms, variableNames) {
        // Clone minterms to avoid modifying original
        let simplified = [...minterms];
        let changed = true;
        
        while (changed) {
            changed = false;
            
            // Try to find pairs that differ by one variable
            for (let i = 0; i < simplified.length; i++) {
                for (let j = i + 1; j < simplified.length; j++) {
                    // Find differing variables
                    const diffIndices = [];
                    
                    for (let k = 0; k < variableNames.length; k++) {
                        const var1 = simplified[i][k];
                        const var2 = simplified[j][k];
                        
                        if (var1 !== var2) {
                            diffIndices.push(k);
                        }
                    }
                    
                    // If they differ by exactly one variable, they can be simplified
                    if (diffIndices.length === 1) {
                        // Create new term without the differing variable
                        const newTerm = simplified[i].filter((_, idx) => idx !== diffIndices[0]);
                        
                        // Add new term if not already present
                        const termExists = simplified.some(term => 
                            term.length === newTerm.length && 
                            term.every((v, idx) => v === newTerm[idx])
                        );
                        
                        if (!termExists) {
                            simplified.push(newTerm);
                            changed = true;
                        }
                    }
                }
            }
            
            // Remove redundant terms
            if (changed) {
                // Sort terms by length (shortest first)
                simplified.sort((a, b) => a.length - b.length);
                
                // Remove terms that are made redundant by shorter terms
                for (let i = 0; i < simplified.length; i++) {
                    for (let j = i + 1; j < simplified.length; j++) {
                        // Check if term i is a subset of term j
                        const isSubset = simplified[i].every(varI => 
                            simplified[j].some(varJ => varJ === varI)
                        );
                        
                        if (isSubset) {
                            // Remove term j as it's redundant
                            simplified.splice(j, 1);
                            j--;
                        }
                    }
                }
            }
        }
        
        // Convert back to DNF string
        return simplified.map(term => {
            if (term.length === 0) {
                return '1'; // Empty term equals 1
            }
            return `(${term.join(' & ')})`;
        }).join(' | ');
    }

    // Display results
    function displayResults(dnf, steps, truthTableValues, variableNames) {
        // Display DNF
        dnfResult.textContent = dnf;
        
        // Display steps
        stepsResult.innerHTML = '';
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';
            stepDiv.innerHTML = `
                <span class="step-number">Шаг ${index + 1}:</span> ${step.description}
                <div class="expression">${step.expression}</div>
            `;
            stepsResult.appendChild(stepDiv);
        });
        
        // Generate truth table
        generateTruthTable(truthTableValues, variableNames);
    }

    // Generate truth table
    function generateTruthTable(truthTableValues, variableNames) {
        // Clear previous table
        truthTable.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('tr');
        
        // Add headers for variables
        variableNames.forEach(name => {
            const th = document.createElement('th');
            th.textContent = name;
            headerRow.appendChild(th);
        });
        
        // Add header for function result
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f';
        headerRow.appendChild(resultTh);
        
        truthTable.appendChild(headerRow);
        
        // Create data rows
        truthTableValues.forEach(row => {
            const tableRow = document.createElement('tr');
            
            // Add variable values
            variableNames.forEach(name => {
                const td = document.createElement('td');
                td.textContent = row.assignment[name] ? '1' : '0';
                tableRow.appendChild(td);
            });
            
            // Add function result
            const resultTd = document.createElement('td');
            resultTd.textContent = row.result ? '1' : '0';
            resultTd.className = row.result ? 'highlight' : '';
            tableRow.appendChild(resultTd);
            
            truthTable.appendChild(tableRow);
        });
    }
});