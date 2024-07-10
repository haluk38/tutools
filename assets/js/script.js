function addStep() {
    let originalStep = document.querySelector('.step');
  
    let clone = originalStep.cloneNode(true);
    
    // Modifier les identifiants et les attributs
    let inputs = clone.querySelectorAll('input, textarea');
    let newId = Date.now();
    let nmb = document.querySelectorAll('.step').length
    inputs.forEach(function(input) {
        input.value = ''; // Effacer les valeurs des champs clonés
        let id = input.getAttribute('id');
        if (id) {
            input.setAttribute('id', newId);
            input.setAttribute('name', input.getAttribute('name').replace('[0][', '[' + nmb + ']['));
        }
    });
    
    document.getElementById('steps-container').appendChild(clone);
}


