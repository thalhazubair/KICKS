/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function addToCart(proId) {
  $.ajax({
    url: "/addcart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cartCount").html();
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
        Swal.fire({
          title: "Added to cart!",
          icon: "success",
          confirmButtonText: "continue",
        });
      }
      if (response.productExist) {
        Swal.fire({
          title: "Product exist in cart!",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
      if (response.stock) {
        Swal.fire({
          title: "Out Of Stock!",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
    },
  });
}

function addToWishlist(proId) {
  $.ajax({
    url: "/addTowishlist/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        Swal.fire({
          title: "Added to wishlist!",
          icon: "success",
          confirmButtonText: "continue",
        });
      }
      if (response.productExist) {
        Swal.fire({
          title: "Alredy Exist in wishlist",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
      if (response.cart) {
        Swal.fire({
          title: "Already Exist cart!",
          text: "Please visit cart",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
    },
  });
}

function addToCartWish(proId) {
  $.ajax({
    url: "/addcart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cartCount").html();
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
        Swal.fire({
          title: "Product added to cart!",
          icon: "success",
          confirmButtonText: "continue",
        });
      }
      if (response.productExist) {
        Swal.fire({
          title: "Product exist in cart!",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
    },
  });
}

function removewishlistProduct(wishlistId, productId) {
    $.ajax({
      url: "/removewishlistProduct",
      data: {
        wishlist: wishlistId,
        product: productId,
      },
      method: "post",
      success: (response) => {
      },
    });
  }

  function validation(){
    let flag=0
    let housename= document.getElementById('housename').value.trim()
    let street= document.getElementById('street').value.trim()
    let city = document.getElementById('city').value.trim()
    let state = document.getElementById('state').value.trim()
    let pincode = document.getElementById('pincode').value.trim()
  
  
    if(housename==''){
      document.getElementById('housenameError').innerHTML="Housename Required"
      flag=1
    }else{
      document.getElementById('housenameError').innerHTML=""
    }

    if(street==''){
        document.getElementById('streetError').innerHTML="street name Required"
        flag=1
    }else{
        document.getElementById('streetError').innerHTML=""
    }

    if(city==''){
        document.getElementById('cityError').innerHTML="city Required"
        flag=1
    }else{
        document.getElementById('cityError').innerHTML=""
    }
  
    if(state==''){
        document.getElementById('stateError').innerHTML="State Required"
        flag=1
    }else{
        document.getElementById('stateError').innerHTML=""
    }

    if(pincode==''){
        document.getElementById('pincodeError').innerHTML="Pincode Required"
        flag=1
    }else{
        document.getElementById('pincodeError').innerHTML=""
    }
  
    if(flag==1){
        return false
    }
  
    }

    function check() {
        let coupon = document.getElementById("coupon").value;
        let total = document.getElementById("total").innerHTML;
        $.ajax({
          url: '/checkCoupon',
          data: {
            coupon,
            total
          },
          method: 'post',
          success: (response) => {
            if (response.user) {
              Swal.fire({
                title: "Coupon already used!",
                icon: "error",
                confirmButtonText: "continue",
              })
            } else if (response.coupon) {
              Swal.fire({
                title: "Coupon Applied!",
                icon: "success",
                confirmButtonText: "continue",
              }).then(() => {
                $("#message").text("Coupon applied successfully!").css("color", "green");
                document.getElementById("total").innerHTML = response.number - response.discountAmount;
                document.getElementById("final").value = response.number - response.discountAmount;
                document.getElementById("coupons").disabled = true;
                
              })
            } else if (response.coupons) {
              Swal.fire({
                title: "Coupon Applied!",
                icon: "success",
                confirmButtonText: "continue",
              }).then(() => {
                $("#message").text("Coupon applied successfully!").css("color", "green");
                document.getElementById("total").innerHTML = response.number - response.discountAmount;
                document.getElementById("final").value = response.number - response.discountAmount;
                document.getElementById("coupons").disabled = true;
              })
            } else if (response.invalid) {
              Swal.fire({
                title: "invalid Coupon",
                icon: "error",
                confirmButtonText: "continue",
              })
            } else if (response.expiry) {
              Swal.fire({
                title: "Coupon expired",
                icon: "error",
                confirmButtonText: "continue",
              })
            } else if (response.purchase) {
              Swal.fire({
                title: "Minimum purchase 100!",
                icon: "error",
                confirmButtonText: "continue",
              })
            }
          }
        })
      }

      function changeQuantity(cartId,proId,count){
            
        let quantity = parseInt(document.getElementById(proId).innerHTML);
        console.log(quantity+"dsfsdf");
        $.ajax({
            url:'/changeQuantity',
            data:{
                cart:cartId,
                product:proId,
                count:count,
                quantity: quantity
            },
            method:'post',
            success:(response)=>{
                if (response.status){
                document.getElementById(proId).innerHTML = quantity + count;
               
                } if (response.stock) {
                    Swal.fire({
                        title: "OOPs..Stock Out!",
                        icon: "error",
                        confirmButtonText: "continue",
                    })
                }
            },
        })
    }

    function removeProduct(cartId, productId) {
        $.ajax({
          url: "/removeProduct",
          data: {
            cart: cartId,
            product: productId,
          },
          method: "post",
          success: (response) => {
          },
        });
      }

// document.getElementById("option1").addEventListener("click", function (event) {
//   event.preventDefault();

//   fetch(event.target.href, { method: "GET" });
// });
