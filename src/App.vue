<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/search">Search</RouterLink>
        |
        <RouterLink to="/addimage">New Image</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>