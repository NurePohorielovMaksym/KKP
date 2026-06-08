import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useReveal } from "../hooks/useReveal.js";
import "./AboutPage.css";
import "../App.css";

export default function AboutPage({ t, toggleLang, lang }) {
    // HERO
    const refHeroEyebrow = useReveal();
    const refHeroTitle   = useReveal();
    const refHeroText    = useReveal();

    // HISTORY
    const refHistoryText = useReveal();
    const refHistoryCard = useReveal();

    // NUMBERS
    const refNumbers     = useReveal();

    // APPROACH
    const refApproachHeader = useReveal();
    const refSteps          = useReveal();

    // TEAM
    const refTeamText  = useReveal();
    const refTeamQuote = useReveal();

    // VALUES
    const refValuesHeader = useReveal();
    const refValuesGrid   = useReveal();

    // CTA
    const refCtaInner = useReveal();

    return (
        <div className="about-page">
            <Header t={t} toggleLang={toggleLang} lang={lang} />

            <link
                href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
                rel="stylesheet"
            />

            {/* ── HERO ── */}
            <section className="about-hero">
                <div className="container">
                    <span ref={refHeroEyebrow} className="about-hero__eyebrow reveal reveal--down">
                        Центр реабілітації
                    </span>
                    <h1 ref={refHeroTitle} className="reveal reveal--down" style={{ transitionDelay: '0.1s' }}>
                        Про наш центр
                    </h1>
                    <p ref={refHeroText} className="reveal reveal-hero-btn" style={{ transitionDelay: '0.2s' }}>
                        Ми об'єднали передові медичні технології та глибоке розуміння
                        людської біомеханіки, щоб створити простір, де відновлення
                        стає природним процесом. Наша мета — не просто усунути біль,
                        а повернути вам повну свободу руху.
                    </p>
                </div>
            </section>

            {/* ── HISTORY ── */}
            <section className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <div
                            ref={refHistoryText}
                            className="about-text-content reveal reveal--left"
                        >
                            <h2>Наша історія та філософія</h2>
                            <p>
                                Центр був заснований групою однодумців-реабілітологів у 2018
                                році. Ми починали з невеликого кабінету, маючи лише одну мету:
                                змінити підхід до реабілітації в Україні, зробивши її
                                пацієнтоцентрованою та науково обґрунтованою.
                            </p>
                            <p>
                                За роки практики ми допомогли понад 5 000 пацієнтів
                                повернутися до активного життя після травм, операцій та
                                хронічних захворювань опорно-рухового апарату. Ми віримо,
                                що організм людини має неймовірний потенціал до
                                самовідновлення — потрібно лише надати йому правильний
                                імпульс і підтримку на кожному кроці.
                            </p>
                            <p>
                                З перших днів роботи ми відмовились від застарілих протоколів
                                і побудували власну методологію на основі сучасних досліджень
                                у галузі нейрофізіології та спортивної медицини. Кожен
                                клінічний протокол регулярно оновлюється нашою науковою
                                радою.
                            </p>
                        </div>
                        <div
                            ref={refHistoryCard}
                            className="about-aside-card reveal reveal--right"
                            style={{ transitionDelay: '0.15s' }}
                        >
                            <h3>Чим ми відрізняємось</h3>
                            <ul className="features-list">
                                <li>Доказова медицина без «фуфломіцинів»</li>
                                <li>Постійне навчання персоналу в країнах ЄС та США</li>
                                <li>Роботизовані системи реабілітації</li>
                                <li>Психологічна підтримка на всіх етапах лікування</li>
                                <li>Індивідуальна «дорожня карта» для кожного пацієнта</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── NUMBERS ── */}
            <section className="about-numbers section-bg-light">
                <div className="container">
                    <div
                        ref={refNumbers}
                        className="numbers-grid reveal reveal--up"
                    >
                        <StatItem value="5 000+" label="Пацієнтів одужали" />
                        <StatItem value="6" label="Років досвіду" />
                        <StatItem value="18" label="Фахівців у команді" />
                        <StatItem value="94%" label="Задоволені результатом" />
                    </div>
                </div>
            </section>

            {/* ── APPROACH ── */}
            <section className="about-section">
                <div className="container">
                    <div
                        ref={refApproachHeader}
                        className="about-section-header reveal reveal--up"
                    >
                        <h2>Як ми працюємо</h2>
                        <p>
                            Ми не використовуємо шаблонних рішень. Кожен пацієнт отримує
                            індивідуальну програму, яка враховує його спосіб життя, фізичний
                            стан та особисті цілі.
                        </p>
                    </div>

                    <div
                        ref={refSteps}
                        className="steps-list reveal reveal--up"
                        style={{ transitionDelay: '0.15s' }}
                    >
                        <StepItem
                            num="01"
                            title="Діагностика та аналіз"
                            text="Все починається з детального функціонального тестування. Ми аналізуємо поставу, ходу, об'єм рухів у суглобах та силу м'язів. Це дозволяє знайти справжню причину болю, яка часто знаходиться далеко від місця дискомфорту. За потреби призначаємо додаткові апаратні дослідження."
                        />
                        <StepItem
                            num="02"
                            title="Складання програми"
                            text="На основі діагностики лікар та фізіотерапевт разом розробляють персональний план. Ви отримуєте чіткий графік візитів, список домашніх вправ та зрозумілі критерії прогресу. Ніяких розмитих обіцянок — лише конкретні цілі й терміни."
                        />
                        <StepItem
                            num="03"
                            title="Активна реабілітація"
                            text="Ми є прихильниками активного відновлення. Замість пасивного лежання на кушетці ви стаєте повноцінним учасником процесу. Кінезіотерапія, вправи з власною вагою та апаратні методики дають стійкий довготривалий результат."
                        />
                        <StepItem
                            num="04"
                            title="Моніторинг і коригування"
                            text="Кожні два тижні ми проводимо контрольну діагностику, щоб бачити прогрес у цифрах і за потреби коригувати навантаження. Ви завжди знаєте, на якому етапі перебуваєте і скільки залишилося до повного відновлення."
                        />
                        <StepItem
                            num="05"
                            title="Підтримка після курсу"
                            text="Одужання не закінчується на останньому візиті. Ми надаємо відео-інструкції вправ для самостійного виконання вдома, проводимо консультації та залишаємось на зв'язку, щоб запобігти рецидивам і закріпити результат."
                        />
                    </div>
                </div>
            </section>

            {/* ── TEAM INTRO ── */}
            <section className="about-section section-bg-light">
                <div className="container">
                    <div className="about-grid about-grid--reverse">
                        <div
                            ref={refTeamText}
                            className="about-text-content reveal reveal--left"
                        >
                            <h2>Наша команда</h2>
                            <p>
                                Наші спеціалісти — це практики, а не теоретики. Кожен із них
                                пройшов навчання у провідних реабілітаційних клініках Польщі,
                                Німеччини та США і регулярно підвищує кваліфікацію на
                                міжнародних конференціях.
                            </p>
                            <p>
                                У нас немає «просто масажистів» чи «просто тренерів». Кожен
                                член команди — сертифікований фізіотерапевт або спортивний
                                реабілітолог із медичною освітою. Ми ретельно відбираємо
                                людей, для яких ця робота — покликання, а не просто посада.
                            </p>
                            <p>
                                Разом ми формуємо середовище взаємної поваги та безперервного
                                навчання. Щомісяця проводимо внутрішні клінічні розбори
                                складних випадків, щоб кожен фахівець зростав разом із
                                командою.
                            </p>
                        </div>
                        <div
                            ref={refTeamQuote}
                            className="about-team-quote reveal reveal--right"
                            style={{ transitionDelay: '0.15s' }}
                        >
                            <blockquote>
                                «Ми не лікуємо діагноз — ми лікуємо людину. Це принципова
                                різниця, яка визначає все, що ми робимо.»
                            </blockquote>
                            <cite>— Засновники центру</cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section className="about-section">
                <div className="container">
                    <div
                        ref={refValuesHeader}
                        className="about-section-header reveal reveal--up"
                    >
                        <h2>Наші цінності</h2>
                    </div>
                    <div
                        ref={refValuesGrid}
                        className="values-grid reveal reveal--up"
                        style={{ transitionDelay: '0.15s' }}
                    >
                        <ValueCard
                            title="Чесність"
                            text="Ми завжди прямо говоримо про терміни одужання та очікувані результати. Не обіцяємо магії, але гарантуємо системний, науково обґрунтований підхід і повну прозорість на кожному етапі."
                        />
                        <ValueCard
                            title="Інновації"
                            text="Світ медицини змінюється щодня. Ми інтегруємо найкращі світові розробки: від лазерної терапії високої інтенсивності до роботизованих тренажерів і біомеханічного тейпування."
                        />
                        <ValueCard
                            title="Людяність"
                            text="Ми знаємо, як важко бути обмеженим у рухах. Підтримка, уважна розмова та щира віра в пацієнта — невід'ємна частина нашої терапії. У нас не буває «зайвих» питань."
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="about-cta section-bg-light">
                <div className="container">
                    <div
                        ref={refCtaInner}
                        className="about-cta__inner reveal reveal--up"
                    >
                        <h2>Хочете дізнатися більше?</h2>
                        <p>
                            Ознайомтеся з переліком наших послуг або познайомтеся з
                            командою фахівців, які будуть поруч на шляху до вашого
                            відновлення.
                        </p>
                        <div className="about-cta__buttons">
                            <Link to="/services" className="cta-btn cta-btn--primary">
                                Наші послуги
                            </Link>
                            <Link to="/doctors" className="cta-btn cta-btn--outline">
                                Наші лікарі
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer t={t} toggleLang={toggleLang} lang={lang} />
        </div>
    );
}

/* ── helpers ── */
function StatItem({ value, label }) {
    return (
        <div className="stat-item">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

function StepItem({ num, title, text }) {
    return (
        <div className="step-item">
            <span className="step-num">{num}</span>
            <div className="step-body">
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
        </div>
    );
}

function ValueCard({ title, text }) {
    return (
        <div className="value-card">
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}