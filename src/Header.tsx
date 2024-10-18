import React from "react";

function Header({ json, html }: any) {
  return (
    <header>
      <button
        id="share-btn"
        onClick={async () => {
          const url = new URL(window.location.href);
          try{

            const response = await fetch(`${window.location.origin}/api/bin`, {
              method: "POST",
              body: JSON.stringify(json),
            });

            if(!response.ok){
              throw new Error(await response.text());
            }
            
            const pasteBinSlug = await response.text();   
            url.searchParams.set("j", pasteBinSlug);
            
            navigator.clipboard.writeText(url.toString());
            history.pushState({}, '', url.href)
            
            alert("URL Copied to clipboard");
          }
          catch(e){
            alert(e.message);
          }
        }}
      >
        Share with JSON
      </button>
    </header>
  );
}

export default Header;
