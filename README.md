<a id="readme-top"></a>
<!-- PROJECT SHIELDS -->
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rumert/firetracker">
    <img src="app/public/logo.png" alt="Logo" width="80" height="80">
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
<details>
  <summary>Table of Contents</summary>
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
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

This web application includes different frameworks and libraries so you can copy any part of it and use in your project.

### Includes:
* Database - some basic concepts using mongoose like query, schema, and expressions
* api - various middlewares, controllers, loggers, and error handling
* api security - bcrypt hash algorithm for jwt auth, rate-limiting, input validation and sanitization, header security
* Testing - e2e tests using Cypress and integration tests using Mocha
* Caching - basic Redis caching for the api, reducing api response delay
* Containerization - Docker containers for both app and api
* CI/CD - Using Github Actions, building the app and making tests in Ubuntu. After successfull CI workflow, deployment of containers begins on self-hosted device from a cloud provider.
* Various customized ui components from Shadcn: table, calendar, card, dropdown menu, popover etc.
* Some next.js/react concepts like SSR and server actions
* Nextjs middleware to handle cookies before generating pages
* Custom jwt authentication

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

These are steps to install this project on your local using Docker

### Prerequisites

* Docker and docker compose
* credentials from the following services:
	
	- access token and refresh token from jwt
	- mongodb url from mongodb atlas
	- ai key from google ai studio
	- redis host and redis password 
	
  
### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/rumert/firetracker
   cd firetracker
   ```
2. rename the .env.example file inside api/src to .env and write your credentials
3. run this command inside the firetracker folder to build the containers:

	 ```sh
   docker compose up
   ```
4. visit localhost:3000 in your browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Add Containerization
- [x] Add CI/CD
- [ ] Microservices architecture
- [ ] Add mocking for services

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
