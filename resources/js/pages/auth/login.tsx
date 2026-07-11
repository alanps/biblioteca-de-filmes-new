import { Head } from '@inertiajs/react';

import Signature from "@/components/signature";
import LeftSide from "@/components/left-side";
import LoginBox from '@/components/login-box';

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
