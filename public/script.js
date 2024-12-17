document.getElementById("dropdownIcon").addEventListener("click", function() { var dropdownContainer = document.getElementById("dropdownContainer"); if (dropdownContainer.style.display === "none") { dropdownContainer.style.display = "block"; } else { dropdownContainer.style.display = "none"; } }); document.getElementById("documentType").addEventListener("change", function() { var passportForm = document.getElementById("passportForm"); var diplomaForm = document.getElementById("diplomaForm"); var otherForm = document.getElementById("otherForm"); 
    // Хомуш кардани ҳамаи формаҳо 
passportForm.style.display = "none"; diplomaForm.style.display = "none"; otherForm.style.display = "none"; 
// Нишон додани формаи интихобшуда 
if (this.value === "passport") { passportForm.style.display = "block"; } else if (this.value === "diploma") { diplomaForm.style.display = "block"; } else if (this.value === "other") { otherForm.style.display = "block"; } });
document.getElementById("openFormButton").addEventListener("click", function() {
    var formContainer = document.getElementById("formContainer");
        if (formContainer.style.display === "none") {
            formContainer.style.display = "block";
        } else {
             formContainer.style.display = "none";
            }
        });



document.getElementById('show-employees').addEventListener('click', (event) => {
    event.preventDefault(); // Пешгирии иваз шудани URL
    const container = document.getElementById('employees-container');
    container.innerHTML = 'Дар ҳоли боргирӣ...';

    fetch('/api/employees') // API роут барои гирифтани рӯйхати кормандон
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let html = `
                    <table border="1" cellspacing="0" cellpadding="5">
                        <tr>
                            <th>ID</th>
                            <th>Ном</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Суроға</th>
                            <th>Вазифа</th>
                            <th>Амалиёт</th>
                        </tr>
                `;

                data.data.forEach(employee => {
                    html += `
                        <tr>
                            <td>${employee.id}</td>
                            <td>${employee.name}</td>
                            <td>${employee.email}</td>
                            <td>${employee.tell}</td>
                            <td>${employee.adress}</td>
                            <td>${employee.vazifa}</td>
                            <td>
                                <button onclick="deleteEmployee(${employee.id})"><i class="fas fa-trash"></i></button>
                                <a href="vazifa.html"><button onclick="update-employee-vazifa(${employee.id})"><i class="fas fa-pen"></i></button></a>
                                <button onclick="#"><i class="fas fa-file"></i></i></button>
                            </td>
                        </tr>
                    `;
                });

                
                html += `</table>`;
                container.innerHTML = html;
            } else {
                container.innerHTML = 'Хатогӣ ҳангоми боргирии маълумот.';
            }
        })
        .catch(error => {
            container.innerHTML = 'Хатогӣ дар сервер: ' + error.message;
        });
});

// Функсия барои ҳазф кардани корманд
function deleteEmployee(id) {
    if (confirm('Оё шумо мехоҳед ин кормандро ҳазф кунед?')) {
        fetch(`/api/employees/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Корманд бо муваффақият ҳазф шуд.');
                    document.getElementById('show-employees').click(); // Рӯйхатро навсозӣ мекунем
                } else {
                    alert('Хатогӣ ҳангоми ҳазф: ' + data.message);
                }
            })
            .catch(error => {
                alert('Хатогӣ дар сервер: ' + error.message);
            });
    }
}

// ивази вазифа 


