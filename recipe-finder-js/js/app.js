// variables 


const categoriasInput = document.querySelector('#categorias');
const formulario = document.querySelector('.card')
const resultadoView = document.querySelector('#resultado')
const modal = new bootstrap.Modal('#modal', {})
const favoritosDiv = document.querySelector('.favoritos');


// eventlisteners 


document.addEventListener('DOMContentLoaded', ()=> {

    // rellenar las categorias
    if (categoriasInput){
        rellenarCategorias()
        categoriasInput.addEventListener('change', listarRecetas);
    }

    if (favoritosDiv){
        obtenerFavoritos();
    }
})

// funciones 

//extraer las recetas de acuerdo a la categoria
function listarRecetas(e){
    const categoria = e.target.value

    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(data => {
            limpiarHTML(resultadoView);
            const listaPlatillos = data.meals
            console.log(listaPlatillos)
            mostrarRecetas(listaPlatillos)

        })
        
        
}

//mostramos las recetas en las vistas 
function mostrarRecetas(platillosLista){

    // listamos los platillos que existen
    platillosLista.forEach((platillo) => {

        const { idMeal, strMeal, strMealThumb} = platillo;

        const recetaContenedor = document.createElement('DIV');
        recetaContenedor.classList.add('col-md-4');


        const recetaCard = document.createElement('DIV');
        recetaCard.classList.add('card', 'mb-4');

        const recetaImagen = document.createElement('IMG');
        recetaImagen.classList.add('card-im-top');
        recetaImagen.alt = `Imagen de la receta ${strMeal ?? platillo.titulo}`;
        recetaImagen.src = strMealThumb ?? platillo.img;

        const recetaCardBody = document.createElement('DIV');
        recetaCardBody.classList.add('card-body'); 

        const recetaHeading = document.createElement('h3');
        recetaHeading.classList.add('card-title', 'mb-3'); 
        recetaHeading.textContent = strMeal ?? platillo.titulo;

        const recetaBtn =  document.createElement('button');
        recetaBtn.classList.add('btn', 'btn-danger', 'w-100'); 
        recetaBtn.textContent = 'Ver Receta';
        recetaBtn.dataset.bsTarget = '#modal';
        recetaBtn.dataset.bsToggle = 'modal';
        recetaBtn.onclick = () => verReceta(idMeal ?? platillo.id);


        recetaCardBody.appendChild(recetaHeading);
        recetaCardBody.appendChild(recetaBtn);

        recetaCard.appendChild(recetaImagen);
        recetaCard.appendChild(recetaCardBody);

        recetaContenedor.appendChild(recetaCard);

        resultadoView.appendChild(recetaContenedor);


    })
}

function vistaReceta(receta){

    const { idMeal, strMeal, strInstructions, strMealThumb} = receta

    // agg contenido al modal
    const modalTitle = document.querySelector('.modal .modal-title')
    const modalBody = document.querySelector('.modal .modal-body')

    modalTitle.textContent = strMeal
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidades</h3>

    `;


    const listGroup = document.createElement('UL');
    listGroup.classList.add('list-group');

    // mostrar ingredientes y cantidades
    for( let i = 1 ; i <=20 ; i++){
        if (receta[`strIngredient${i}`]){
            const ingrediente = receta[`strIngredient${i}`];
            const cantidad = receta[`strMeasure${i}`]

            const ingredienteLi = document.createElement('LI');
            ingredienteLi.classList.add('list-group-item');
            ingredienteLi.textContent = `${ingrediente} ${cantidad}`
            

            listGroup.appendChild(ingredienteLi)
        }
    }

    modalBody.appendChild(listGroup)

    const modalFooter = document.querySelector('.modal-footer');
    limpiarHTML(modalFooter)

    //localstorage 
    
    //botones cerrar y favoritos
    const btnFav = document.createElement('button');
    btnFav.classList.add('btn', 'btn-danger', 'col');
    btnFav.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito'
    btnFav.onclick = () => {

        if (!existeStorage(idMeal)){

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img:strMealThumb
            })
            btnFav.textContent = 'Eliminar Favorito'
            mostrarToast('Guardado en favoritos')

        }else{

            eliminarFavorito(idMeal);
            btnFav.textContent = 'Agregar Favorito'
            mostrarToast('Eliminado de favoritos')
        }

        

    } 

    



    // cerrar modal

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('btn', 'btn-secondary', 'col');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.onclick = () => modal.hide();

    modalFooter.appendChild(btnFav)
    modalFooter.appendChild(btnCerrar)

    modal.show()
}

//function agregando a favorito
function agregarFavorito(recetaObj){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, recetaObj]));
}

function existeStorage(id){

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    return favoritos.some(favorito => favorito.id === id)
}

function eliminarFavorito(id){

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevosFav = favoritos.filter((favorito) => favorito.id !== id  )
    localStorage.setItem('favoritos', JSON.stringify(nuevosFav))
}

function mostrarToast(mensaje){
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = mensaje
    toast.show()

}

// listar las recetas 
function verReceta(id){

    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    fetch(url)
        .then( resultado => resultado.json())
        .then( data => {
            const receta = data.meals[0]
            vistaReceta(receta);
        })
}


//extraer el nombre de las categorias 
function rellenarCategorias(){
    
    //llamamos a la API para extraer las categorias disponibles
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

    fetch(url)
        .then( respuesta => respuesta.json())
        .then( data => {
            const listaCategorias = data.categories;
            
            //creamos un option por cada categoria

            listaCategorias.forEach(categoria => {
                const options = document.createElement('option')
                options.textContent = categoria.strCategory;

                // mostrar en el select 
                categoriasInput.appendChild(options)
            });
        })
}

function obtenerFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
    if(favoritos.length){

        mostrarRecetas(favoritos)
        return;
    }

    const nofavoritos = document.createElement('P');
    nofavoritos.textContent = 'Aun no hay favoritos';
    nofavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')

    resultadoView.appendChild(nofavoritos);
}

function limpiarHTML(ref){

    while(ref.firstChild){
        ref.removeChild(ref.firstChild)
    }
}