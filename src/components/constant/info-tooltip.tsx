import { IconInfoCircle } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type InfoTooltipProps = {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end'; // default is "center"
  message: string;
  className?: string; // optional className for the tooltip,
  icon?: React.ReactNode; // optional icon for the tooltip
};
const InfoToolTip = ({
  side = 'top',
  align = 'center',
  message,
  className,
  icon,
}: InfoTooltipProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <span className="relative text-sm font-semibold cursor-pointer flex items-center">
          {icon || <IconInfoCircle />}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <span className={className}>{message}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default InfoToolTip;
