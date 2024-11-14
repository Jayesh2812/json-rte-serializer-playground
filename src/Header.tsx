import { useGlobalContext } from "./contexts/global.context";
import prettify from "pretty";

function Header() {


  const { json, html, setHtml } = useGlobalContext();


  return (
    <header>

      <button onClick={() => {

        const defaultAttrsToRemove = ["data-.*", "aria-.*"];

        const attributes = prompt("Enter the attributes to remove separated by comma (,)", defaultAttrsToRemove.join(", "))?.split(",").map((attr) => attr.trim());
        if(!attributes) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${html}</body>`, "text/html").body;
        const elements = doc.querySelectorAll("*");
        elements.forEach((element) => {
          attributes.forEach((attr) => {
            const attrs = Array.from(element.attributes).map((a) => a.name).filter(a => a.match(attr));
            attrs.forEach(a => element.removeAttribute(a))  
          });
        }); 

      setHtml(prettify(doc.innerHTML));
        
      }}> Remove HTML Attributes </button>

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
            if( e instanceof Error)
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
