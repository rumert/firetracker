<a id="readme-top"></a>
<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rumert/firetracker">
    <img src="nextjs-app/public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Firetracker</h3>

  <p align="center">
    Personal Finance Tracker
    <br />
    <a href="https://www.firetracker.online">View Website</a>
    ·
    <a href="https://github.com/rumert/firetracker/issues/new?labels=bug">Report Bug</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

## Table of Contents

<ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#includes">Includes</a></li>
      </ul>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
</ol>

<!-- ABOUT THE PROJECT -->
## About The Project

Full-stack budget tracking project combines modern frameworks and libraries to help users manage and visualize their finances effectively.

### Includes:
* Database - some basic concepts using mongoose like query, schema, and expressions
* api - middlewares, controllers, loggers, and an error handler
* api security - bcrypt hash algorithm for jwt auth, rate-limiting, input validation and sanitization, header security
* Testing - e2e tests using Playwright, unit tests using Jest, and load testing using Artillery.
* Caching - basic Redis caching for the apis, reducing response delay
* Containerization - Docker containers for microservices
* CI/CD - Using Github Actions, building the app and making tests. After successfull CI workflow, deployment of containers begins on your desired device.
* Customized ui components from Shadcn: table, calendar, card, dropdown menu, popover etc.
* Some next.js/react concepts like SSR and server actions

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![Express][Express.js]][Express-url]
* [![React][React.js]][React-url]
* [![Next][Next.js]][Next-url]
* [![Radix][RadixUI]][Radix-url]
* [![Tailwind][Tailwind]][Tailwind-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

These are steps to install and use this project in any way you want:

<details>
  <summary>Development</summary>
  <ol>
    <li>
      <p>Clone the Repo:</p>
      <pre><code>git clone https://github.com/rumert/firetracker.git</code></pre>
    </li>
    <li>
      <p>Prepare Databases:</p>
      <pre><code>docker compose -f docker-compose.development.yaml up --build</code></pre>
    </li>
    <li>
      <p>Create your own jwt secrets and change the corresponding values inside the env files under the both apis' src folder. Make sure the values for both apis are same.</p>
    </li>
    <li>
      <p>Install and Run:</p>
      <ol>
        <li>
          <p>App:</p>
          <pre><code>cd nextjs-app</code>
npm i</pre>
          <pre><code>npm run dev</code></pre>
        </li>
        <li>
          <p>Main Api:</p>
          <pre><code>cd main-api</code>
npm i</pre>
          <pre><code>npm run dev</code></pre>
        </li>
        <li>
          <p>Auth Api:</p>
          <pre><code>cd auth-api</code>
npm i</pre>
          <pre><code>npm run dev</code></pre>
        </li>
      </ol>
    </li>
    <li>
      <p>visit localhost:3000 in your browser</p>
    </li>
  </ol>
</details>

<details>
  <summary>Test</summary>
  <ol>
    <li>
      <p>Clone the Repo:</p>
      <pre><code>git clone https://github.com/rumert/firetracker.git</code></pre>
    </li>
    <li>
      <p>Prepare All Services:</p>
      <pre><code>docker compose -f docker-compose.test.yaml up --build</code></pre>
    </li>
    <li>
      <p>Run tests:</p>
      <ol>
        <li>
          <p>App:</p>
          <pre><code>cd nextjs-app</code>
npm run test</pre>
        </li>
        <li>
          <p>Main Api:</p>
          <pre><code>cd main-api</code>
npm run test</pre>
        </li>
        <li>
          <p>Auth Api:</p>
          <pre><code>cd auth-api</code>
npm run test</pre>
        </li>
      </ol>
    </li>
  </ol>
</details>

<details>
  <summary>Production</summary>
  <ol>
    <li>
      <p>Clone the Repo:</p>
      <pre><code>git clone https://github.com/rumert/firetracker.git</code></pre>
    </li>
    <li>
      <p>Prepare All Services:</p>
      <pre><code>docker compose -f docker-compose.production.yaml up --build</code></pre>
    </li>
    <li>
      <p>Visit localhost:3000 in your browser (some features won't work on local since this env requires https)</p>
    </li>
  </ol>
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Add Containerization
- [x] Add CI/CD
- [x] Microservices architecture
- [ ] Dashboard
- [ ] and more features...

See the [open issues](https://github.com/rumert/firetracker/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Rumert Kıran - rumertkiran@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/rumert/firetracker/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/rumert-kiran
[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[RadixUI]: https://img.shields.io/badge/radix%20ui-161618.svg?style=for-the-badge&logo=radix-ui&logoColor=white
[Radix-url]: https://www.radix-ui.com/
[Tailwind]: https://img.shields.io/badge/tailwind%20css-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
