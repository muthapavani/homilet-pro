import { Link } from "react-router-dom";
import "./card.css";
import img1BHKFlat from "../../assets/landingimg/1_bhk_flat.avif";
import img2BHKFlat from "../../assets/landingimg/2- bhk-flat.jpg";
import img3BHKFlat from "../../assets/landingimg/3-bhk-flat.jpeg";
import img1BHKHouse from "../../assets/landingimg/1-bhk-house.webp";
import img2BHKHouse from "../../assets/landingimg/2-bhk-house.jpg";
import img3BHKHouse from "../../assets/landingimg/3-BHK-home.webp";


const properties = [

  {
    id: 1,
    name: "1BHK Apartment",
    type: "Flat",
    location: "hyderabad , Ind",
    price: "Rs 5,200/month",
    image: img1BHKFlat,
  },
  {
    id: 2,
    name: "2BHK Apartment",
    type: "Flat",
    location: "vizag, Ind",
    price: "Rs 6,800/month",
    image: img2BHKFlat,
  },
  {
    id: 3,
    name: "3BHK Apartment",
    type: "Flat",
    location: "vijayawada, Ind",
    price: "Rs 7,500/month",
    image:  img3BHKFlat,
  },
  {
    id: 4,
    name: "1BHK House",
    type: "House",
    location: "rajamadry , Ind",
    price: "Rs 5,500/month",
    image: img1BHKHouse,
  },
  {
    id: 5,
    name: "2BHK House",
    type: "House",
    location: "hyderabad , Ind",
    price: "Rs 6,200/month",
    image: img2BHKHouse,
  },
  {
    id: 6,
    name: "3BHK House",
    type: "House",
    location: "vizag , Ind",
    price: "RS 7,000/month",
    image:  img3BHKHouse,
  },
];

const Cards = () => {
  return (
    <section id="homes"  className="h-section">
      <h2 className="h-title"> Find Your Ideal Home </h2>
      <div className="h-container">
        {properties.map((property) => (
          <div key={property.id} className="h-card">
            <img src={property.image} alt={property.name} className="h-image" />
            <div className="h-info">
              <h3>{property.name}</h3>
              <p>{property.type} - {property.location}</p>
              <span className="price">{property.price}</span>
              <a href="#nav" className="view-btn">View</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Cards;
