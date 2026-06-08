import React from "react";
import '../App.css';
import './Footer.css';

function Footer({t, toggleLang, lang}){
    return(
        <footer className="footer">
            
        <div className="container footer">
                <div className="div-logo-footer">
                    <a href="" className="logo footer">Kine<span className="span-logo-footer">tra</span></a>
                    <p className="logo-footer-text">{t.logo_footer_text}</p>
                </div>

            <div className="div-link-footer">
                <h4>{t.footer_h4_1}</h4>
                <ul className="links-footer">
                    <li>
                        <a className="footer-nav-link" href="/">{t.nav_home}</a>
                    </li>
                    <li>
                        <a className="footer-nav-link" href="/">{t.nav_about}</a>
                    </li>
                    <li>
                        <a className="footer-nav-link" href="/">{t.nav_service}</a>
                    </li>
                    <li>
                        <a className="footer-nav-link" href="/">{t.nav_doctors}</a>
                    </li> 
                </ul>
            </div>

            <div className="div-address-footer" id="address">
                <h4>{t.footer_h4_2}</h4>
                <address>
                    <p className="address-text-footer">{t.address_text_footer_1}:<a className="address-link-footer" href="tel:+110001111111">  +11 (000) 111-1-111</a></p>
                    <p className="address-text-footer">Email:<a className="address-link-footer" href="mailto:kinetra@gmail.com">  kinetra@gmail.com</a></p>
                    <p className="address-text-footer">{t.address_text_footer_3}</p>
                    <p className="address-text-footer">{t.address_text_footer_4}</p>
                </address>
            </div>
            
            <div className="div-lang-footer">
                <h4>{t.footer_h4_3}</h4>
                <button onClick={toggleLang} className='language'>
          {lang === 'ua' ? (
             <>
              <span className="text-ua">УКР</span> 
              <span className="text-slash-footer">/</span> 
              <span className="text-eng">ENG</span>
             </>
            ) : (
            <>
              <span className="text-eng">ENG</span> 
              <span className="text-slash-footer">/</span> 
              <span className="text-ua">УКР</span>
            </>
            )}
        </button>
    </div>  
           
         </div >
            <div className="div-policy">
                <p>{t.policy_text}</p>
                <ul className="div-policy-list">
                    <li>
                        <a href="">
                            <svg className="icon-social" width="24" height="24">
                                <use className="item-icon" href="./icons.svg#facebook"></use>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="">
                            <svg className="icon-social" width="24" height="24">
                                <use className="item-icon" href="./icons.svg#instagram"></use>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="">
                            <svg className="icon-social" width="24" height="24">
                                <use className="item-icon" href="./icons.svg#whatsapp"></use>
                            </svg>
                        </a>
                    </li>
                </ul>
            </div>
    </footer>
    );
}

export default Footer