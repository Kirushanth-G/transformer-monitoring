import axios from 'axios';
//uncomment based on use case

//for deployment/front end development
export default axios.create({
  baseURL:
    'http://ec2-54-169-154-147.ap-southeast-1.compute.amazonaws.com:8080',
});

//for backend development
// export default axios.create({
//   baseURL: 'http://localhost:8080',
// });
