Meteor.subscribe('Products');

function selectedProduct(){
    return Products.findOne( {slug: Session.get('currentProduct') } );
}

Template.product.helpers({
    product: function() {
        return selectedProduct() ;
    }
})