import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route=createFileRoute('/_authenticated/optovyj-prajs')({beforeLoad:()=>{throw redirect({to:'/kabinet'});}});
