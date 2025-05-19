function closePopup(){
    document.getElementById('popup-closeid').addEventListener('click', function(evt){
        document.getElementById('quickviewPopup').style.display = 'none';
    })
}
function openPopup(openModal){
    let productVariants = {};
    openModal.forEach((btn) => {
        btn.addEventListener('click', function(evt){
            const handle = '/products/'+evt.target.dataset.handle+'.json';
            fetch(handle)
            .then((response) => response.json())
            .then((res) => {
                const product = res.product;
                let size = product.options.filter(opt => opt.name == 'Size');
                size = size[0].values;
                let color = product.options.filter(opt => opt.name == 'Color');
                color = color[0].values;
                if(product){
                    productVariants = JSON.stringify(product.variants);
                    document.getElementById('productImg').src = product.image.src;
                    document.getElementById('productTitle-id').innerText = product.title;
                    document.getElementById('productPrice-id').innerText = product.variants[0].price + ' ' + product.variants[0].price_currency;
                    document.getElementById('productBody-id').innerHTML = product.body_html;
                    const divContainer = document.createElement('div');
                    const divContainer2 = document.createElement('div');
                    const divContainer3 = document.createElement('div');
                    const divContainerWrapper = document.createElement('div');
                    divContainer3.className = 'variantsData';
                    divContainer3.id = 'variantsData';
                    divContainer3.dataset.variants = productVariants;
                    color.forEach((v,i) => {
                        const input = document.createElement('input')
                        input.type = "radio";
                        input.name= "color";
                        input.id = "color"+i;
                        input.value = v;

                        const label = document.createElement('label');
                        label.className = 'color-swatch'
                        label.setAttribute('for','color'+i)
                        label.textContent=v
                        divContainer.appendChild(input)
                        divContainer.appendChild(label)
                    })

                    const select = document.createElement('select');
                    select.className = "size";
                    select.name = "size";
                    size.forEach((v,i)=>{
                         const option = document.createElement('option');
                         option.textContent = v;
                         option.value = v;
                         select.appendChild(option)
                    })
                    divContainer2.appendChild(select);
                    divContainerWrapper.appendChild(divContainer3);
                    document.querySelector('.color-swatches').innerHTML = divContainer.innerHTML
                    document.querySelector('.option-size').innerHTML = divContainer2.innerHTML
                    document.querySelector('#quickViewVariants').innerHTML = divContainerWrapper.innerHTML
                    document.getElementById('addToCart-id').dataset.id = product.id
                    document.getElementById('quickviewPopup').style.display = 'block';
                }
            });
        })
    })
}
const addToCart = (id, anotherVariant) => {
    let formData = {
        'items': [{
            'id': id,
            'quantity': 1
        }]
    };
    if(anotherVariant){
        formData.items.push({
            'id': anotherVariant,
            'quantity': 1
        })
    }
    fetch('/cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then((response) => {
        if(response.ok) {
            document.getElementById('quickviewPopup').style.display = 'none';
            fetch(`/cart.js`)
            .then((response) => response.json())
            .then((cartD) => {
                const {item_count = 0} = cartD;
                if(cartD.item_count > 0){
                    alert('Product added to cart');
                    if(document.querySelector('.cart-count-bubble')){
                        document.querySelector('.cart-count-bubble span').innerText = item_count || 0;
                    }else{
                        const iteme = document.createElement('div')
                        iteme.classList = 'cart-count-bubble';
                        const spanItem = document.createElement('span')
                        iteme.appendChild(spanItem)
                        document.querySelector('.header__icon--cart').appendChild(iteme)
                        spanItem.innerText = item_count || 0;
                    }
    
                    
                    document.getElementById('addToCart-id').style.background = '#000';
                    document.getElementById('addToCart-id').querySelector('span').classList.add('hidden');
                }
            })
            .catch((e) => {
                console.error(e);
            })
        }
    })
}
document.addEventListener('DOMContentLoaded', function(){
    const openModal = document.querySelectorAll('.plus_container');
    openPopup(openModal)
    closePopup()
    document.getElementById('addToCart-id').addEventListener('click', function(evt){
        const opton1 = document.querySelector('.color-swatches input[type="radio"]:checked')?.value || null;
        const opton2 = document.querySelector('.option-size select option:checked')?.value || null;
        
        if(!opton1 || !opton2){
            alert('Please select all options');
            return;
        }
        evt.target.style.background = '#ccc';
        evt.target.querySelector('span').classList.remove('hidden');
        const variantTitle = opton2 + ' / ' + opton1;
        const variantsData = document.querySelector('.variantsData').dataset.variants;
        const variants = JSON.parse(variantsData);
        const variant = variants.find(v => v.title == variantTitle);
        let anotherVariant = null;
        if(variantTitle == 'M / Black'){
            anotherVariant = 49799787872560;
        }
        addToCart(variant.id, anotherVariant)
    })
})