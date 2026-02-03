import { CV } from '@/types/cv';
import { CVThemeModern } from './themes/CVThemeModern';
import { CVThemeClassic } from './themes/CVThemeClassic';
import { CVThemeMinimalist } from './themes/CVThemeMinimalist';
import { CVThemeProfessional } from './themes/CVThemeProfessional';
import { CVThemeCreative } from './themes/CVThemeCreative';
import { CVThemeElegant } from './themes/CVThemeElegant';
import { CVThemeTech } from './themes/CVThemeTech';
import { CVThemeAcademic } from './themes/CVThemeAcademic';
import { CVThemeIndustrial } from './themes/CVThemeIndustrial';
import { CVThemeStartup } from './themes/CVThemeStartup';
import { CVThemeExecutive } from './themes/CVThemeExecutive';
import { CVThemeNature } from './themes/CVThemeNature';
import { CVThemeCompact } from './themes/CVThemeCompact';
import { CVThemeBold } from './themes/CVThemeBold';

export type CVTheme =
    | 'modern' | 'classic' | 'minimalist'
    | 'professional' | 'creative' | 'elegant'
    | 'tech' | 'academic' | 'industrial'
    | 'startup' | 'executive' | 'nature'
    | 'compact' | 'bold';

interface CVPreviewProps {
    data: CV;
    theme?: CVTheme;
}

export function CVPreview({ data, theme = 'modern' }: CVPreviewProps) {
    switch (theme) {
        case 'classic': return <CVThemeClassic data={data} />;
        case 'minimalist': return <CVThemeMinimalist data={data} />;
        case 'professional': return <CVThemeProfessional data={data} />;
        case 'creative': return <CVThemeCreative data={data} />;
        case 'elegant': return <CVThemeElegant data={data} />;
        case 'tech': return <CVThemeTech data={data} />;
        case 'academic': return <CVThemeAcademic data={data} />;
        case 'industrial': return <CVThemeIndustrial data={data} />;
        case 'startup': return <CVThemeStartup data={data} />;
        case 'executive': return <CVThemeExecutive data={data} />;
        case 'nature': return <CVThemeNature data={data} />;
        case 'compact': return <CVThemeCompact data={data} />;
        case 'bold': return <CVThemeBold data={data} />;
        case 'modern':
        default:
            return <CVThemeModern data={data} />;
    }
}
