import { pageMetadata } from '@/lib/metadata';
import ChooseService from '@/components/choose-service';

export const metadata = pageMetadata(
    '選擇我們的服務｜實瀚科技', 
    '從五大服務類別挑選你感興趣的方向，全選或逐項選取，實瀚科技幫你找到適合的起步方式。', 
    '/choose-service'
);

export default function Page() { return <ChooseService />; }
