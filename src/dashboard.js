import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, logout, db } from "./firebase";
import { query, collection, getDocs, orderBy, setDoc, doc, addDoc } from "firebase/firestore";

import "./dashboard.css";
import {useReactToPrint} from "react-to-print";

function Dashboard(){
    const products =[
        {
            name: "Fillet Burger",
            price: 300
        },
        {
            name: "Patty Burger",
            price: 250
        },
        {
            name: "Zinger Burger",
            price: 250
        },
        {
            name: "Shawarma",
            price: 350
        },
        {
            name: "Shawarma Fries",
            price: 320
        },
        {
            name:"Panini",
            price: 350
        },
        {
            name: "Platter (Small)",
            price: 450
        },
        {
            name: "Platter (Double)",
            price: 850
        },
        {
            name: "Platter (Jumbo)",
            price: 1650
        },
        {
            name: "Wings",
            price: 300
        },
        {
            name: "Addon: Fries",
            price: 80
        },
        {
            name: "Addon: Drink",
            price: 50
        },
        {
            name: "Addon: Chipotle Dip",
            price: 30
        },
        {
            name: "Addon: Garlic Dip",
            price: 30
        },
        {
            name: "Addon: Olives",
            price: 30
        },
        {
            name: "Addon: Cheese",
            price: 30
        }];


    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    const [selectedItem, setSelectedItem] = useState([]);
    const itemSelected = (data) => {
        
        setSelectedItem(selectedItem => [...selectedItem, data]);
        
    }
    const [cart, setCart] = useState([]);
    const addToCart = () => {
        setCart(selectedItem);
        // console.log(cart)
    }
    const [rerender, setRerender] = useState(false);


    function deleteItem(item){
        let array = selectedItem.filter(function(s) { return s != item });
        setSelectedItem(array);
     }

     function updateSelected(e, id, opt){
         let v = e.target.value
        selectedItem[id][opt] = v;
        setRerender(!rerender);
     }
     
    useEffect(() => {
        if (loading) {
          // maybe trigger a loading screen
          return;
        }
        
        if (!user) {
            navigate("/");
        }
        
        // setRerender(!rerender);
        
        
      }, [user, loading, cart, rerender]);
    

     function PlaceOrder(){
        
        

        addDoc(collection(db, "orders"), {order: cart} ).then((v) => {
            alert("Wait for Print")
        });

        handlePrint();
        handlePrint2();
        
        
        
            //   const data = doc.docs;
            //   setProducts(data);
            //   setProductsLoaded(true);
        
     }

    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Smokeys Order - Kitchen Receipt"
    });

    const handlePrint2 = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Smokeys Order - Customer Receipt"
    });


    return (
        
        <>
        
        {/* {console.log(pro)} */}
        <div className="dashboard"> 
         <div className="products">
             <h2>Select a Product</h2>
        {products.map((data, id) => {  
            // {console.log(id)}
            return(
                <>
                <div className="item" key={id} htmlFor={id} onClick={() => itemSelected(data)}>
                    <div className="name">{data.name}</div>
                    <div className="price">Rs. {data.price}</div>
                    {/* {data.data().flavour ? <> <div>Mild</div> <div>Pickled</div> </>  : <></> } */}
                </div>
                
                </>
                // console.log()
            )
            }
        )}
        </div>
        <div className="selected">
            <h2>Selected Item</h2>
            
            {selectedItem ? 
            <>
            {selectedItem.map((item, id) => {
                return (
                    <div className="order" key={'s'+id}>
                        <div className="name">{item.name}</div>
                        <div className="price">Rs. {item.price}</div>
                        <input type="number" defaultValue="1" className="qty" onChange={(value) => {updateSelected(value, id, 'qty')}}/>
                        <input type="text" placeholder="Mild, Spicy or Pickle etc" onChange={(value) => updateSelected(value, id, 'comment')}/>
                        <br/>
                        <button className="remove" onClick={() => deleteItem(item)}>Remove</button>
                    </div>
                )
            })}
            
                
            </>
            
            : "none selected"}
            
            <div className="btnContainer"><button className="add" onClick={addToCart}>Add to Cart</button></div>
        </div>
        <div className="selected">
            <h2>Order Details</h2>
            
            <OrderSlip data={cart} ref={componentRef}/>
            <button className="confirmOrder" onClick={PlaceOrder}>Confirm Order</button>
        </div>
        {/* <button onClick={logout}>Logout</button> */}
        </div>
        
        </>
    )

}
export default Dashboard;

export const OrderSlip = React.forwardRef((props, ref) => {
    console.log(props)
    let totalCost = 0;
    return (
        <div ref={ref}>
        {props.data.length > 0 ? <>
        {props.data.map((item, id) => {
            
            // console.log(item.qty)
            if (item.qty != undefined){ 
                item.total = item.price * item.qty;
                totalCost = totalCost + item.total
            }else{
                totalCost = totalCost + item.price
            }
            return (
                <div className="orderItem" key={'c'+id}>
                    <div className="main">
                        <div className="name">{item.name}</div>
                        <div className="comment">{item.comment != undefined ? <>({item.comment})</> : <></>}</div>
                    </div>
                    <div className="price">{item.qty == undefined ? <>1 x {item.price} = {item.price}</> : <>{item.qty} x {item.price} = {item.total}</> }</div>
                </div>
            )
        })}
        <div className="total"><strong>Total Bill: {totalCost}</strong></div>
    </> : <>nothing in the cart yet</>}
    </div>
    )
} )