import { Head } from '@inertiajs/react';

import Signature from "@/components/signature";
import LeftSide from "@/components/leftSide";
import LoginBox from '@/components/loginBox';

export default function Login() {
    return (
        <>
            <Head />
            
            <div className="page">

                <LeftSide />

                <div className="rightSide">
                    
                    <LoginBox />
            
                    <div className="bottomBox"></div>

                </div>

            </div>

            <Signature />

        </>
    );
}
