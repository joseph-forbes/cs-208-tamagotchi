"use strict";

class Shop extends React.Component {
  componentDidMount() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../shop-style.css';
    document.head.appendChild(link);
    console.log(link);
  }
  render() {
    return /*#__PURE__*/React.createElement("main", {
      id: "main",
      className: "shop"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "awning"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "shop-title"
    }, "THE GOOBIE SHOP")))), /*#__PURE__*/React.createElement("div", {
      className: "shop-wall"
    }, /*#__PURE__*/React.createElement("div", {
      className: "shop-window"
    }, /*#__PURE__*/React.createElement("div", {
      className: "window-horizontal"
    }), /*#__PURE__*/React.createElement("div", {
      className: "window-vertical"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "left-shelf"
    }, /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    }), /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    }), /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    })), /*#__PURE__*/React.createElement("div", {
      className: "right-shelf"
    }, /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    }), /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    }), /*#__PURE__*/React.createElement("div", {
      className: "shelf-row"
    })), /*#__PURE__*/React.createElement("div", {
      className: "counter"
    }, /*#__PURE__*/React.createElement("button", {
      className: "buy-button",
      onClick: openShop
    }, "BUY!")), /*#__PURE__*/React.createElement("div", {
      className: "accessories-popup",
      id: "accessoriesPopup"
    }, /*#__PURE__*/React.createElement("h2", null, "ACCESSORIES"), /*#__PURE__*/React.createElement("div", {
      className: "accessories"
    }, /*#__PURE__*/React.createElement("p", null, "Accessories will go here!")), /*#__PURE__*/React.createElement("button", {
      className: "close-button",
      onClick: closeShop
    }, "CLOSE")), /*#__PURE__*/React.createElement("div", {
      className: "bg-warning text-white"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        load("hub");
      }
    }, "Click here to go to the main hub!")));
  }
}

// OPENS ACCESSORIES POPUP
function openShop() {
  document.getElementById("accessoriesPopup").style.display = "block";
}

// CLOSES ACCESSORIES POPUP
function closeShop() {
  document.getElementById("accessoriesPopup").style.display = "none";
}
