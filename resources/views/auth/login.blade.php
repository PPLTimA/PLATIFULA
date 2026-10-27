<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PLATIFUL - Sign In</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-900 m-0">
<!-- Ubah w-[1440px] menjadi w-full dan min-h-[1040px] menjadi min-h-screen -->
<div class="w-full min-h-screen bg-neutral-900 flex justify-start items-start overflow-hidden">
  
  <!-- Kolom Kiri -->
  <div class="w-[660px] min-h-screen p-14 bg-teal-950 flex flex-col justify-start items-start gap-9 overflow-hidden">
    <div class="inline-flex justify-start items-center gap-2 overflow-hidden">
      <div class="size-8 bg-emerald-500 rounded-[10px] inline-flex flex-col justify-center items-center overflow-hidden">
        <div class="size-5 relative overflow-hidden">
          <div class="w-3.5 h-4 left-[3.67px] top-[2.75px] absolute outline outline-2 outline-offset-[-0.90px] outline-emerald-950"></div>
        </div>
      </div>
      <div class="justify-start text-neutral-100 text-2xl font-extrabold font-['Manrope']">PLATIFUL</div>
    </div>
    <div class="self-stretch flex flex-col justify-start items-start gap-4 overflow-hidden">
      <div class="px-2 py-1 bg-teal-950 rounded-md inline-flex justify-start items-start overflow-hidden">
        <div class="justify-start text-emerald-500 text-xs font-bold font-['Inter']">WELCOME TO YOUR NEIGHBORHOOD FOOD LOOP</div>
      </div>
      <div class="self-stretch justify-start text-neutral-100 text-6xl font-bold font-['Manrope'] leading-[64.90px]">Good to have<br/>you at the table.</div>
      <div class="self-stretch justify-start text-slate-400 text-base font-normal font-['Inter'] leading-6">A little less spent. A little less wasted.<br/>Find something delicious on your way home.</div>
    </div>
    <div class="self-stretch h-96 bg-white rounded-[20px]"></div>
    <div class="inline-flex justify-start items-start gap-5 overflow-hidden">
      <div class="justify-start text-neutral-100 text-xs font-normal font-['Inter']">✓ Verified stores</div>
      <div class="justify-start text-neutral-100 text-xs font-normal font-['Inter']">✓ Affordable finds</div>
      <div class="justify-start text-neutral-100 text-xs font-normal font-['Inter']">✓ Pickup & pay locally</div>
    </div>
    <div class="self-stretch justify-start text-slate-400 text-xs font-normal font-['Inter']">Commercial surplus-food marketplace · Jakarta, Indonesia</div>
  </div>

  <!-- Kolom Kanan -->
  <div class="flex-1 px-24 py-11 flex flex-col justify-start items-start gap-6 overflow-hidden">
    <div class="self-stretch justify-start text-emerald-500 text-xs font-normal font-['Inter']">← Back to food discovery</div>
    <div class="self-stretch flex flex-col justify-start items-start gap-2.5 overflow-hidden">
      <div class="self-stretch justify-start text-neutral-100 text-4xl font-bold font-['Manrope'] leading-10">Welcome back.</div>
      <div class="self-stretch justify-start text-slate-400 text-sm font-normal font-['Inter'] leading-5">Sign in to reserve your next good find.</div>
    </div>
    <div class="self-stretch min-h-16 p-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-700 flex flex-col justify-start items-start gap-1.5 overflow-hidden">
      <div class="self-stretch justify-start"><span class="text-neutral-100 text-xs font-semibold font-['Inter'] leading-5">Email address<br/></span><span class="text-slate-400 text-xs font-normal font-['Inter'] leading-6">customer@platiful.com</span></div>
    </div>
    <div class="self-stretch min-h-16 p-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-700 flex flex-col justify-start items-start gap-1.5 overflow-hidden">
      <div class="self-stretch justify-start"><span class="text-neutral-100 text-xs font-semibold font-['Inter'] leading-5">Password<br/></span><span class="text-slate-400 text-xs font-normal font-['Inter'] leading-6">Enter your password</span></div>
    </div>
    <div class="self-stretch inline-flex justify-between items-start overflow-hidden">
      <div class="justify-start text-slate-400 text-xs font-normal font-['Inter']">□ Keep me signed in</div>
      <div class="justify-start text-emerald-500 text-xs font-normal font-['Inter']">Forgot password?</div>
    </div>
    <div class="self-stretch px-4 py-3 bg-emerald-600 rounded-lg inline-flex justify-center items-center gap-2 overflow-hidden">
      <div class="size-4 relative overflow-hidden">
        <div class="size-2.5 left-[3.75px] top-[3.75px] absolute outline outline-2 outline-offset-[-0.90px] outline-neutral-100"></div>
      </div>
      <div class="justify-start text-neutral-100 text-sm font-bold font-['Inter'] leading-5">Sign in as customer</div>
    </div>
    <div class="self-stretch text-center justify-start text-slate-400 text-xs font-normal font-['Inter']">New here? Create a customer account →</div>
    <div class="self-stretch h-px bg-slate-700"></div>
    <div class="self-stretch text-center justify-start text-slate-500 text-[10px] font-normal font-['Inter']">By continuing, you agree to PLATIFUL’s Terms and Privacy Policy.</div>
  </div>

</div>
</body>
</html>