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

                <div className="right-side">
                    
                    <LoginBox />
            
                    <div className="bottom-box"></div>

                </div>

            </div>

            <Signature />

        </>
    );
}
