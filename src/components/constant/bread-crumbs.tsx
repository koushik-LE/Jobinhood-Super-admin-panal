import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';

const CustomBreadcrumb = () => {
  const pathname = usePathname();
  const router = useRouter();

  const pathnames = pathname.split('/').filter(x => x);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const pageExists = (href: string) => href !== '/settings';

  if (pathnames.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="text-sm text-muted-foreground">
      {pathnames.map((value, index) => {
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const isClickable = !isLast && pageExists(href);

        return (
          <BreadcrumbItem key={href}>
            <BreadcrumbLink
              // onClick={router.push(isClickable ? href : '')}
              // href={isClickable ? href : ''}
              onClick={e => {
                if (!isClickable) {
                  e.preventDefault();
                } else if (pathname !== href) {
                  router.push(href);
                }
              }}
              className={`ml-1 cursor-pointer ${
                isLast ? 'text-brand cursor-default' : 'hover:text-brand'
              } ${!isClickable ? '' : ''}`}
            >
              {`${index > 0 ? ' / ' : ''}${isNaN(Number(value)) ? capitalize(value) : value}`}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
