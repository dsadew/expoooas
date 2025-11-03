import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const BrainIcon: React.FC<SvgProps> = (props) => (
  <Svg 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <Path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A5.25 5.25 0 0 0 7.5 15.38a15.44 15.44 0 0 1-1.423-.823A3 3 0 0 0 4.134 10.5m1.586.257a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A5.25 5.25 0 0 0 7.5 15.38a15.44 15.44 0 0 1-1.423-.823A3 3 0 0 0 4.134 10.5m6.538 5.622a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118a5.25 5.25 0 0 0 4.956-6.193 15.44 15.44 0 0 1-1.423-.823A3 3 0 0 0 4.134 10.5m3.536 8.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118a5.25 5.25 0 0 0 4.956-6.193 15.44 15.44 0 0 1-1.423-.823A3 3 0 0 0 4.134 10.5" 
    />
    <Path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 21a5.25 5.25 0 0 0 5.25-5.25V9a5.25 5.25 0 0 0-5.25-5.25h-1.55a5.25 5.25 0 0 0-5.25 5.25v6.75A5.25 5.25 0 0 0 12 21z" 
    />
  </Svg>
);

export default BrainIcon;
