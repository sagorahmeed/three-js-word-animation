addEventListener("load", (event) => {

    const particleCount = 7000;
    const particleSize = 0.5;
    const defaultAnimationSpeed = 0.5,
        morphAnimationSpeed = 30,
        color = '#FFFFFF';
    
    const triggers = document.getElementsByTagName('span');
    
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    var scene = new THREE.Scene();
    
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 0; // Adjust camera position for smoother view
    camera.position.z = 60; // Set better starting distance for camera
    
    var light = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(light);
    
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.enableZoom = false; // Disable zoom on scroll
    
    var particles = new THREE.Geometry();
    var texts = [];
    
    var pMaterial = new THREE.PointCloudMaterial({
        size: particleSize,
    });
    
    var loader = new THREE.FontLoader();
    var typeface = 'https://dl.dropboxusercontent.com/s/bkqic142ik0zjed/swiss_black_cond.json?';
    
    loader.load(typeface, (font) => {
        Array.from(triggers).forEach((trigger, idx) => {
            texts[idx] = {};
    
            texts[idx].geometry = new THREE.TextGeometry(trigger.textContent, {
                font: font,
                size: window.innerWidth * 0.02,
                height: 4,
                curveSegments: 10,
            });
    
            THREE.GeometryUtils.center(texts[idx].geometry);
    
            texts[idx].particles = new THREE.Geometry();
    
            texts[idx].points = THREE.GeometryUtils.randomPointsInGeometry(texts[idx].geometry, particleCount);
    
            createVertices(texts[idx].particles, texts[idx].points);
    
            enableTrigger(trigger, idx);
        });
    });
    
    // Initialize particle system
    for (var p = 0; p < particleCount; p++) {
        var vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 0;
    
        particles.vertices.push(vertex);
    }
    
    function createVertices(emptyArray, points) {
        for (var p = 0; p < particleCount; p++) {
            var vertex = new THREE.Vector3();
            vertex.x = points[p]['x'];
            vertex.y = points[p]['y'];
            vertex.z = points[p]['z'];
    
            emptyArray.vertices.push(vertex);
        }
    }
    
    function enableTrigger(trigger, idx) {
        trigger.setAttribute('data-disabled', false);
    
        trigger.addEventListener('click', () => {
            morphTo(texts[idx].particles, trigger.dataset.color);
        });
    
        if (idx === 0) {
            // Add slight delay before starting morph effect
            setTimeout(() => morphTo(texts[idx].particles, trigger.dataset.color), 500);
        }
    }
    
    var particleSystem = new THREE.PointCloud(particles, pMaterial);
    particleSystem.sortParticles = true;
    scene.add(particleSystem);
    
    const normalSpeed = defaultAnimationSpeed / 100,
        fullSpeed = morphAnimationSpeed / 100;
    
    let animationVars = {
        speed: normalSpeed,
        color: color,
        rotation: -35,
        rotationDirection: 1
    };
    
    function animate() {
        particleSystem.rotation.y += animationVars.speed * animationVars.rotationDirection;
    
        if (particleSystem.rotation.y > Math.PI / 8) {
            particleSystem.rotation.y = Math.PI / 8;
            animationVars.rotationDirection = -1;
        } else if (particleSystem.rotation.y < -Math.PI / 8) {
            particleSystem.rotation.y = -Math.PI / 8;
            animationVars.rotationDirection = 1;
        }
    
        particles.verticesNeedUpdate = true;
    
        camera.lookAt(scene.position);
        particleSystem.material.color = new THREE.Color(animationVars.color);
    
        window.requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
    
    function morphTo(newParticles, color = '#FFFFFF') {
        // Morph particle system with smoother transitions
        TweenMax.to(animationVars, 0.8, {
            ease: Power4.easeInOut,
            speed: fullSpeed,
            rotation: animationVars.rotation === 35 ? -35 : 35,
            onComplete: slowDown
        });
    
        TweenMax.to(animationVars, 2, {
            ease: Linear.easeNone,
            color: color,
            delay: 0.3
        });
    
        for (var i = 0; i < particles.vertices.length; i++) {
            TweenMax.to(particles.vertices[i], 2, {
                ease: Elastic.easeOut.config(0.1, 0.3),
                x: newParticles.vertices[i].x,
                y: newParticles.vertices[i].y,
                z: newParticles.vertices[i].z
            });
        }
    }
    
    function slowDown() {
        TweenMax.to(animationVars, 0.3, {
            ease: Power2.easeOut,
            speed: normalSpeed,
            delay: 0.2
        });
    }
    
    // Scroll event listener to disable camera zooming
    let scrollTimeout;
    window.addEventListener('wheel', (event) => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
    
        // Prevent default scroll behavior (zoom)
        event.preventDefault();
    
        // Add a delay to allow for smooth scrolling
        scrollTimeout = setTimeout(() => {
            camera.position.z = 60; // Reset the camera position if any zoom occurred
        }, 50);
    }, { passive: false });
    
});

