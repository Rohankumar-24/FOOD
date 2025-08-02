import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./CarouselBanner.css"; 

const CarouselBanner = () => {
  return (
    <div className="carousel-wrapper">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={3000}
        transitionTime={600}
      >
        <div>
          <img src="/images/burger.jpg" alt="Fresh Burgers" />
          <p className="legend">Fresh Burgers</p>
        </div>
        <div>
          <img src="/images/delivery.png" alt="Fast Delivery" />
          <p className="legend">Fast Delivery</p>
        </div>
        <div>
          <img src="/images/deals.jpeg" alt="Zesty Deals" />
          <p className="legend">Zesty Deals Await!</p>
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselBanner;
