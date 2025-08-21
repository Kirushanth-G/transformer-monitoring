import axios from 'axios';
export default axios.create({
  baseURL:
    'http://ec2-54-169-154-147.ap-southeast-1.compute.amazonaws.com:8080',
});
